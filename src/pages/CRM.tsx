import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Package, Bell, ArrowLeft, LogOut, Shield, Target, LayoutDashboard, FileText, ClipboardList, Inbox } from "lucide-react";
import { toast } from "sonner";
import OrdersTab from "@/components/crm/OrdersTab";
import RemindersTab from "@/components/crm/RemindersTab";
import UsersTab from "@/components/crm/UsersTab";
import LeadsTab from "@/components/crm/LeadsTab";
import DashboardTab from "@/components/crm/DashboardTab";
import InvoiceTab from "@/components/crm/InvoiceTab";
import JobsheetTab from "@/components/crm/JobsheetTab";
import EnquiryTab from "@/components/crm/EnquiryTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CRM = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [newPasswordMode, setNewPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      // Handle password recovery event
      if (event === "PASSWORD_RECOVERY") {
        setNewPasswordMode(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Logged in!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setTempPassword("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=forgot_password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: "Bearer " + import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );
      const data = await res.json();
      if (data.temporary_password) {
        setTempPassword(data.temporary_password);
        toast.success("Temporary password generated!");
      } else {
        toast.error(data.error || "No account found with that email.");
      }
    } catch {
      toast.error("Failed to generate temporary password");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPasswordMode(false);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  // Password recovery mode
  if (newPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-display text-gradient">Set New Password</h1>
            <p className="text-muted-foreground mt-2">Enter your new password below</p>
          </div>
          <form onSubmit={handleSetNewPassword} className="space-y-3">
            <Input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            <Button type="submit" variant="hero" className="w-full">Update Password</Button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-display text-gradient">ACD CRM</h1>
            <p className="text-muted-foreground mt-2">Sign in to manage your business</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" variant="hero" className="w-full" disabled={authLoading}>Sign In</Button>
          </form>
          <div className="text-center space-y-2">
            <button onClick={() => setForgotOpen(true)} className="text-sm text-primary hover:underline">Forgot password?</button>
            <br />
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to website</Link>
          </div>

          <Dialog open={forgotOpen} onOpenChange={(open) => { setForgotOpen(open); if (!open) { setForgotEmail(""); setTempPassword(""); } }}>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Reset Password</DialogTitle></DialogHeader>
              {tempPassword ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Temporary password generated for <strong>{forgotEmail}</strong>:</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-lg text-center select-all break-all">{tempPassword}</div>
                  <p className="text-xs text-muted-foreground">Copy and share this password securely with the user. They should change it after logging in.</p>
                  <Button variant="hero" className="w-full" onClick={() => { setForgotOpen(false); setForgotEmail(""); setTempPassword(""); }}>Done</Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <p className="text-sm text-muted-foreground">Enter the user's email to generate a temporary password.</p>
                  <Input type="email" placeholder="Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                  <Button type="submit" variant="hero" className="w-full" disabled={forgotLoading}>Generate Temporary Password</Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link to="/"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="font-display text-xl text-gradient">ACD CRM</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>
      <main className="container py-6 max-w-5xl">
        <Tabs defaultValue="dashboard" className="relative">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
            <TabsTrigger value="enquiry" className="gap-2"><Inbox className="h-4 w-4" /><span className="hidden sm:inline">Enquiry</span></TabsTrigger>
            <TabsTrigger value="leads" className="gap-2"><Target className="h-4 w-4" /><span className="hidden sm:inline">Leads</span></TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" /><span className="hidden sm:inline">Orders</span></TabsTrigger>
            <TabsTrigger value="invoice" className="gap-2"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Invoice</span></TabsTrigger>
            <TabsTrigger value="jobsheet" className="gap-2"><ClipboardList className="h-4 w-4" /><span className="hidden sm:inline">Jobsheet</span></TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Reminders</span></TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Users</span></TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" forceMount className="data-[state=inactive]:hidden"><DashboardTab /></TabsContent>
          <TabsContent value="enquiry" forceMount className="data-[state=inactive]:hidden"><EnquiryTab /></TabsContent>
          <TabsContent value="leads" forceMount className="data-[state=inactive]:hidden"><LeadsTab /></TabsContent>
          <TabsContent value="orders" forceMount className="data-[state=inactive]:hidden"><OrdersTab /></TabsContent>
          <TabsContent value="invoice" forceMount className="data-[state=inactive]:hidden"><InvoiceTab /></TabsContent>
          <TabsContent value="jobsheet" forceMount className="data-[state=inactive]:hidden"><JobsheetTab /></TabsContent>
          <TabsContent value="reminders" forceMount className="data-[state=inactive]:hidden"><RemindersTab /></TabsContent>
          <TabsContent value="users" forceMount className="data-[state=inactive]:hidden"><UsersTab currentUserId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CRM;
