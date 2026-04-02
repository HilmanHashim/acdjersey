import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, KeyRound, Mail, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  is_admin: boolean;
};

const roleBadge: Record<string, string> = {
  superadmin: "bg-red-500/10 text-red-600 border-red-500/30",
  admin: "bg-primary/10 text-primary border-primary/30",
  user: "",
};

const UsersTab = ({ currentUserId }: { currentUserId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [editForm, setEditForm] = useState({ email: "", password: "" });
  const [newPassword, setNewPassword] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["auth-users"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=list`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return (await res.json()) as { users: AuthUser[]; caller_is_admin: boolean; caller_role: string };
    },
  });

  const users = data?.users ?? [];
  const isAdmin = data?.caller_is_admin ?? false;
  const callerRole = data?.caller_role ?? "user";
  const isSuperadmin = callerRole === "superadmin";

  const callApi = async (action: string, body: any) => {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Request failed");
    }
    return res.json();
  };

  const createMutation = useMutation({
    mutationFn: () => callApi("create", { email: form.email, password: form.password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("User created");
      setForm({ email: "", password: "" });
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No user selected");
      return callApi("update", { user_id: editing.id, email: editForm.email || undefined, password: editForm.password || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("User updated");
      setEditing(null);
      setEditOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No user selected");
      return callApi("update", { user_id: editing.id, password: newPassword });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("Password changed");
      setEditing(null);
      setPasswordOpen(false);
      setNewPassword("");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => callApi("delete", { user_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("User deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const setRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      callApi("set_role", { user_id: userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("Role updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => callApi("reset_password", { email }),
    onSuccess: () => toast.success("Password reset email sent"),
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (u: AuthUser) => {
    setEditing(u);
    setEditForm({ email: u.email, password: "" });
    setEditOpen(true);
  };

  const openChangePassword = (u: AuthUser) => {
    setEditing(u);
    setNewPassword("");
    setPasswordOpen(true);
  };

  // Can the caller change this user's role?
  const canChangeRole = (u: AuthUser) => {
    if (u.id === currentUserId) return false;
    if (isSuperadmin) return true;
    if (isAdmin && u.role !== "superadmin") return true;
    return false;
  };

  // Available roles caller can assign
  const availableRoles = isSuperadmin ? ["user", "admin", "superadmin"] : ["user", "admin"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={roleBadge[callerRole] || ""}>
            {callerRole.charAt(0).toUpperCase() + callerRole.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isAdmin && (
            <Button variant="outline" size="sm" onClick={() => openChangePassword({ id: currentUserId, email: "", created_at: "", last_sign_in_at: null, role: "user", is_admin: false })}>
              <KeyRound className="h-4 w-4 mr-1" /> Change My Password
            </Button>
          )}
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Add User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Create User</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
                  <Input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <Input type="password" placeholder="Password * (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <Button type="submit" variant="hero" className="w-full" disabled={createMutation.isPending}>Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Edit user dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Edit User</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-3">
            <Input type="email" placeholder="New email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input type="password" placeholder="New password (leave blank to keep)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} minLength={6} />
            <Button type="submit" variant="hero" className="w-full" disabled={updateMutation.isPending}>Update</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={passwordOpen} onOpenChange={(v) => { setPasswordOpen(v); if (!v) { setEditing(null); setNewPassword(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Change Password{editing?.email ? ` — ${editing.email}` : ""}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); changePasswordMutation.mutate(); }} className="space-y-3">
            <Input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            <Button type="submit" variant="hero" className="w-full" disabled={changePasswordMutation.isPending}>Change Password</Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No users found.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Email</TableHead>
                <TableHead className="w-[15%]">Role</TableHead>
                <TableHead className="w-[15%]">Created</TableHead>
                <TableHead className="w-[22%]">Last Sign In</TableHead>
                <TableHead className="w-[20%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium truncate">
                    {u.email}
                    {u.id === currentUserId && <span className="ml-2 text-xs text-primary">(you)</span>}
                  </TableCell>
                  <TableCell>
                    {canChangeRole(u) ? (
                      <Select value={u.role} onValueChange={(role) => setRoleMutation.mutate({ userId: u.id, role })}>
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((r) => (
                            <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={roleBadge[u.role] || ""}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm truncate">{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-sm truncate">{u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "MMM d, yyyy h:mm a") : "Never"}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {isAdmin ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openChangePassword(u)} title="Change password"><KeyRound className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => resetPasswordMutation.mutate(u.email)} title="Send reset email"><Mail className="h-3.5 w-3.5" /></Button>
                          {u.id !== currentUserId && u.role !== "superadmin" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate(u.id); }}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </>
                      ) : u.id === currentUserId ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openChangePassword(u)} title="Change password"><KeyRound className="h-3.5 w-3.5" /></Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
