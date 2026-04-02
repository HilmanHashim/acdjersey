import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Package, FileText, DollarSign, TrendingUp } from "lucide-react";

type UserActivity = {
  email: string;
  leads: number;
  contacts: number;
  orders: number;
  quotations: number;
  totalRevenue: number;
};

const DashboardTab = () => {
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: authUsers = [] } = useQuery({
    queryKey: ["auth-users-list"],
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
      if (!res.ok) return [];
      const json = await res.json();
      return (json.users ?? []) as { id: string; email: string }[];
    },
  });

  // Build user email map
  const userEmailMap: Record<string, string> = {};
  authUsers.forEach((u) => { userEmailMap[u.id] = u.email; });

  // Overview stats
  const totalLeads = leads.length;
  const totalContacts = contacts.length;
  const totalOrders = orders.length;
  const totalQuotes = quotes.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const leadsByStage = {
    cold: leads.filter((l) => l.stage === "cold").length,
    prospect: leads.filter((l) => l.stage === "prospect").length,
    first_buy: leads.filter((l) => l.stage === "first_buy").length,
  };

  // Per-user activity
  const userActivityMap: Record<string, UserActivity> = {};
  const getOrCreate = (userId: string | null): UserActivity | null => {
    if (!userId) return null;
    if (!userActivityMap[userId]) {
      userActivityMap[userId] = {
        email: userEmailMap[userId] || userId.slice(0, 8) + "...",
        leads: 0,
        contacts: 0,
        orders: 0,
        quotations: 0,
        totalRevenue: 0,
      };
    }
    return userActivityMap[userId];
  };

  leads.forEach((l) => {
    const a = getOrCreate((l as any).created_by);
    if (a) a.leads++;
  });
  contacts.forEach((c) => {
    const a = getOrCreate((c as any).created_by);
    if (a) a.contacts++;
  });
  orders.forEach((o) => {
    const a = getOrCreate((o as any).created_by);
    if (a) {
      a.orders++;
      a.totalRevenue += Number(o.total_amount) || 0;
    }
  });
  quotes.forEach((q) => {
    const a = getOrCreate((q as any).created_by);
    if (a) a.quotations++;
  });

  const userActivities = Object.values(userActivityMap);

  const statCards = [
    { label: "Total Leads", value: totalLeads, icon: Target, color: "text-blue-500" },
    { label: "Contacts", value: totalContacts, icon: Users, color: "text-green-500" },
    { label: "Orders", value: totalOrders, icon: Package, color: "text-yellow-500" },
    { label: "Quotations", value: totalQuotes, icon: FileText, color: "text-purple-500" },
    { label: "Total Revenue", value: `RM ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color} shrink-0`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Leads Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-600">{leadsByStage.cold}</p>
              <p className="text-sm text-muted-foreground">Cold</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-600">{leadsByStage.prospect}</p>
              <p className="text-sm text-muted-foreground">Prospect</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-2xl font-bold text-green-600">{leadsByStage.first_buy}</p>
              <p className="text-sm text-muted-foreground">First Buy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-User Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Users className="h-5 w-5" /> Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userActivities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">
              No per-user data yet. Activity will appear here as team members create records.
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">User</TableHead>
                    <TableHead className="w-[12%] text-center">Leads</TableHead>
                    <TableHead className="w-[14%] text-center">Contacts</TableHead>
                    <TableHead className="w-[12%] text-center">Orders</TableHead>
                    <TableHead className="w-[12%] text-center">Quotes</TableHead>
                    <TableHead className="w-[20%] text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivities.map((u) => (
                    <TableRow key={u.email}>
                      <TableCell className="font-medium truncate">{u.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{u.leads}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{u.contacts}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{u.orders}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{u.quotations}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono truncate">
                        RM {u.totalRevenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
