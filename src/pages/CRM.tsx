import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Users, Package, FileText, Bell, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";
import ContactsTab from "@/components/crm/ContactsTab";
import OrdersTab from "@/components/crm/OrdersTab";
import QuotationsTab from "@/components/crm/QuotationsTab";
import RemindersTab from "@/components/crm/RemindersTab";

const CRM = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logged in!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Check your email.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-display text-gradient">ACD CRM</h1>
            <p className="text-muted-foreground mt-2">Sign in to manage your business</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" variant="hero" className="w-full" disabled={authLoading}>
              {authMode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {authMode === "login" ? "No account? " : "Have an account? "}
            <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="text-primary hover:underline">
              {authMode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to website</Link>
          </div>
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
        <Tabs defaultValue="contacts">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="contacts" className="gap-2"><Users className="h-4 w-4" /><span className="hidden sm:inline">Contacts</span></TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" /><span className="hidden sm:inline">Orders</span></TabsTrigger>
            <TabsTrigger value="quotations" className="gap-2"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Quotes</span></TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Reminders</span></TabsTrigger>
          </TabsList>
          <TabsContent value="contacts"><ContactsTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="quotations"><QuotationsTab /></TabsContent>
          <TabsContent value="reminders"><RemindersTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CRM;
