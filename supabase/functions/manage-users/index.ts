import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, publishableKey);

    // ─── FORGOT PASSWORD (no auth required) ───
    if (req.method === "POST" && action === "forgot_password") {
      const { email: resetEmail } = await req.json();
      if (!resetEmail) return json({ error: "Email required" }, 400);

      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = userList?.users?.some((u) => u.email === resetEmail);
      
      if (userExists) {
        const { error } = await supabaseAuth.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${req.headers.get("origin") || supabaseUrl}/crm`,
        });
        if (error) throw error;
      }

      return json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    }

    // All other actions require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: callerError } = await supabaseAuth.auth.getUser(token);
    if (callerError || !caller) return json({ error: "Unauthorized" }, 401);

    // Fetch caller's roles
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const callerRoleSet = new Set((callerRoles ?? []).map((r: any) => r.role));
    const isSuperadmin = callerRoleSet.has("superadmin");
    const isAdmin = callerRoleSet.has("admin") || isSuperadmin;
    const callerRole = isSuperadmin ? "superadmin" : isAdmin ? "admin" : "user";

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ─── LIST ───
    if (req.method === "GET" && action === "list") {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      const { data: allRoles } = await supabaseAdmin.from("user_roles").select("*");

      const users = data.users.map((u) => {
        const roles = (allRoles ?? []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role);
        const role = roles.includes("superadmin") ? "superadmin" : roles.includes("admin") ? "admin" : "user";
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          role,
          is_admin: role === "admin" || role === "superadmin",
        };
      });
      return json({ users, caller_is_admin: isAdmin, caller_role: callerRole });
    }

    // ─── CREATE USER ───
    if (req.method === "POST" && action === "create") {
      if (!isAdmin) return json({ error: "Only admins can create users" }, 403);
      const { email, password } = await req.json();
      if (!email || !password) return json({ error: "Email and password required" }, 400);
      const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });
      if (error) throw error;
      return json({ id: data.user.id, email: data.user.email });
    }

    // ─── UPDATE USER ───
    if (req.method === "POST" && action === "update") {
      const { user_id, email, password } = await req.json();
      if (!user_id) return json({ error: "user_id required" }, 400);

      // Non-admins can only change their own password
      if (!isAdmin && user_id !== caller.id) return json({ error: "You can only update your own account" }, 403);
      if (!isAdmin && email) return json({ error: "Only admins can change email addresses" }, 403);

      // Admin cannot change superadmin's password
      if (!isSuperadmin && user_id !== caller.id) {
        const { data: targetRoles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user_id);
        const targetIsSuperadmin = (targetRoles ?? []).some((r: any) => r.role === "superadmin");
        if (targetIsSuperadmin) return json({ error: "Only superadmins can modify superadmin accounts" }, 403);
      }

      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user_id, updateData);
      if (error) throw error;
      return json({ id: data.user.id, email: data.user.email });
    }

    // ─── DELETE USER ───
    if (req.method === "POST" && action === "delete") {
      if (!isAdmin) return json({ error: "Only admins can delete users" }, 403);
      const { user_id } = await req.json();
      if (!user_id) return json({ error: "user_id required" }, 400);

      // Cannot delete superadmins unless you're superadmin
      if (!isSuperadmin) {
        const { data: targetRoles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user_id);
        if ((targetRoles ?? []).some((r: any) => r.role === "superadmin")) {
          return json({ error: "Cannot delete a superadmin" }, 403);
        }
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return json({ success: true });
    }

    // ─── SET ROLE ───
    if (req.method === "POST" && action === "set_role") {
      if (!isAdmin) return json({ error: "Only admins can manage roles" }, 403);
      const { user_id, role } = await req.json();
      if (!user_id || !role) return json({ error: "user_id and role required" }, 400);
      if (!["user", "admin", "superadmin"].includes(role)) return json({ error: "Invalid role" }, 400);

      // Only superadmins can assign superadmin
      if (role === "superadmin" && !isSuperadmin) return json({ error: "Only superadmins can assign superadmin role" }, 403);

      // Cannot change a superadmin's role unless you're superadmin
      if (!isSuperadmin) {
        const { data: targetRoles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user_id);
        if ((targetRoles ?? []).some((r: any) => r.role === "superadmin")) {
          return json({ error: "Cannot change superadmin's role" }, 403);
        }
      }

      // Remove existing roles
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);

      // Add new role (if not "user" — user is default with no row)
      if (role !== "user") {
        const { error } = await supabaseAdmin.from("user_roles").insert({ user_id, role });
        if (error) throw error;
      }

      return json({ success: true });
    }

    // ─── RESET PASSWORD (admin) ───
    if (req.method === "POST" && action === "reset_password") {
      if (!isAdmin) return json({ error: "Only admins can send reset emails" }, 403);
      const { email: resetEmail } = await req.json();
      if (!resetEmail) return json({ error: "Email required" }, 400);
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${req.headers.get("origin") || supabaseUrl}/crm`,
      });
      if (error) throw error;
      return json({ success: true, message: "Password reset email sent" });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
