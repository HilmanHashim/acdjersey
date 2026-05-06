import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

const SALESPEOPLE = ["JEED", "DIDO", "MUNIR", "ALIFF", "HILMAN", "UMAR"] as const;
const ENERGY_LEVELS = ["🔥 On Fire", "💪🏻 Bring it on", "✊🏻 All Good", "😐 Tough day", "😔 Struggling"];
const MONTHLY_TARGET = 55000;

type SalesEntry = {
  id: string;
  salesperson: string;
  entry_date: string;
  job_name: string | null;
  jersey_type: string | null;
  quantity: number | null;
  price_per_pc: number | null;
  new_leads: number;
  prospects_contacted: number;
  quotations_sent: number;
  orders_closed: number;
  revenue_closed: number;
  activity_today: string | null;
  energy_level: string | null;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const daysLeftInMonth = () => {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return last - d.getDate();
};

const SalesTrackerTab = () => {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery<SalesEntry[]>({
    queryKey: ["sales_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return (data || []) as SalesEntry[];
    },
  });

  // Realtime subscription for live dashboard updates
  useEffect(() => {
    const ch = supabase
      .channel("sales_entries_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_entries" }, () => {
        qc.invalidateQueries({ queryKey: ["sales_entries"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  // Aggregations
  const today = todayISO();
  const mStart = monthStart();

  const aggregate = (rows: SalesEntry[]) => {
    return rows.reduce(
      (acc, r) => {
        acc.leads += r.new_leads || 0;
        acc.contacted += r.prospects_contacted || 0;
        acc.quotes += r.quotations_sent || 0;
        acc.closed += r.orders_closed || 0;
        acc.revenue += Number(r.revenue_closed) || 0;
        acc.pcs += r.quantity || 0;
        return acc;
      },
      { leads: 0, contacted: 0, quotes: 0, closed: 0, revenue: 0, pcs: 0 }
    );
  };

  const monthRows = useMemo(() => entries.filter((e) => e.entry_date >= mStart), [entries, mStart]);
  const todayRows = useMemo(() => entries.filter((e) => e.entry_date === today), [entries, today]);

  const monthTotals = aggregate(monthRows);
  const pctAchieved = (monthTotals.revenue / MONTHLY_TARGET) * 100;

  const perPersonMonth = SALESPEOPLE.map((sp) => ({
    name: sp,
    ...aggregate(monthRows.filter((r) => r.salesperson === sp)),
  }));
  const perPersonToday = SALESPEOPLE.map((sp) => ({
    name: sp,
    ...aggregate(todayRows.filter((r) => r.salesperson === sp)),
    energy: todayRows.find((r) => r.salesperson === sp)?.energy_level || "—",
  }));

  return (
    <div className="space-y-6">
      {/* DASHBOARD */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Target className="h-5 w-5" /> Monthly Target Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            <Stat label="Target" value={`RM ${MONTHLY_TARGET.toLocaleString()}`} icon={Target} />
            <Stat label="Revenue" value={`RM ${monthTotals.revenue.toLocaleString()}`} icon={DollarSign} accent />
            <Stat label="% Achieved" value={`${pctAchieved.toFixed(1)}%`} icon={TrendingUp} />
            <Stat label="Orders Closed" value={monthTotals.closed} icon={Users} />
            <Stat label="Total Leads" value={monthTotals.leads} icon={Users} />
            <Stat label="Days Left" value={daysLeftInMonth()} icon={Target} />
          </div>
          <div className="mt-4 h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
              style={{ width: `${Math.min(100, pctAchieved)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">👤 Team Performance — Today</CardTitle>
        </CardHeader>
        <CardContent>
          <PerfTable rows={perPersonToday} showEnergy />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">📈 Month Cumulative — Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <PerfTable rows={perPersonMonth} />
        </CardContent>
      </Card>

      {/* ENTRY FORMS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">📝 Daily Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={SALESPEOPLE[0]}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              {SALESPEOPLE.map((sp) => (
                <TabsTrigger key={sp} value={sp} className="text-xs">{sp}</TabsTrigger>
              ))}
            </TabsList>
            {SALESPEOPLE.map((sp) => (
              <TabsContent key={sp} value={sp} forceMount className="data-[state=inactive]:hidden">
                <SalespersonForm salesperson={sp} entries={entries.filter((e) => e.salesperson === sp)} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value, icon: Icon, accent }: any) => (
  <div className={`p-3 rounded-lg border ${accent ? "bg-primary/10 border-primary/30" : "bg-muted/30"}`}>
    <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const PerfTable = ({ rows, showEnergy }: { rows: any[]; showEnergy?: boolean }) => (
  <div className="border rounded-lg overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-center">Leads</TableHead>
          <TableHead className="text-center">Contacted</TableHead>
          <TableHead className="text-center">Quotes</TableHead>
          <TableHead className="text-center">Closed</TableHead>
          <TableHead className="text-right">Revenue (RM)</TableHead>
          <TableHead className="text-center">Pcs</TableHead>
          {showEnergy && <TableHead>Energy</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell className="text-center">{r.leads}</TableCell>
            <TableCell className="text-center">{r.contacted}</TableCell>
            <TableCell className="text-center">{r.quotes}</TableCell>
            <TableCell className="text-center">{r.closed}</TableCell>
            <TableCell className="text-right font-mono">{r.revenue.toLocaleString()}</TableCell>
            <TableCell className="text-center">{r.pcs}</TableCell>
            {showEnergy && <TableCell className="text-xs">{r.energy}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const SalespersonForm = ({ salesperson, entries }: { salesperson: string; entries: SalesEntry[] }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    entry_date: todayISO(),
    job_name: "",
    jersey_type: "",
    quantity: "",
    price_per_pc: "",
    new_leads: "",
    prospects_contacted: "",
    quotations_sent: "",
    orders_closed: "",
    revenue_closed: "",
    activity_today: "",
    energy_level: "🔥 On Fire",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const payload = {
      salesperson,
      entry_date: form.entry_date,
      job_name: form.job_name || null,
      jersey_type: form.jersey_type || null,
      quantity: form.quantity ? Number(form.quantity) : null,
      price_per_pc: form.price_per_pc ? Number(form.price_per_pc) : null,
      new_leads: Number(form.new_leads) || 0,
      prospects_contacted: Number(form.prospects_contacted) || 0,
      quotations_sent: Number(form.quotations_sent) || 0,
      orders_closed: Number(form.orders_closed) || 0,
      revenue_closed: Number(form.revenue_closed) || 0,
      activity_today: form.activity_today || null,
      energy_level: form.energy_level || null,
    };
    const { error } = await supabase.from("sales_entries").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Entry added");
    setForm((f) => ({
      ...f,
      job_name: "", jersey_type: "", quantity: "", price_per_pc: "",
      new_leads: "", prospects_contacted: "", quotations_sent: "", orders_closed: "", revenue_closed: "",
      activity_today: "",
    }));
    qc.invalidateQueries({ queryKey: ["sales_entries"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("sales_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["sales_entries"] });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <Input type="date" value={form.entry_date} onChange={(e) => update("entry_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Job Name</label>
          <Input value={form.job_name} onChange={(e) => update("job_name", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Jersey Type</label>
          <Input value={form.jersey_type} onChange={(e) => update("jersey_type", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Quantity</label>
          <Input type="number" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Price / Pc</label>
          <Input type="number" value={form.price_per_pc} onChange={(e) => update("price_per_pc", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">New Leads</label>
          <Input type="number" value={form.new_leads} onChange={(e) => update("new_leads", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Contacted</label>
          <Input type="number" value={form.prospects_contacted} onChange={(e) => update("prospects_contacted", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Quotes Sent</label>
          <Input type="number" value={form.quotations_sent} onChange={(e) => update("quotations_sent", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Orders Closed</label>
          <Input type="number" value={form.orders_closed} onChange={(e) => update("orders_closed", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Revenue (RM)</label>
          <Input type="number" value={form.revenue_closed} onChange={(e) => update("revenue_closed", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">What are you doing today</label>
          <Input value={form.activity_today} onChange={(e) => update("activity_today", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Energy</label>
          <Select value={form.energy_level} onValueChange={(v) => update("energy_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ENERGY_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={submit} variant="hero" className="gap-2">
        <Plus className="h-4 w-4" /> Add Entry
      </Button>

      <div>
        <h4 className="text-sm font-semibold mb-2">Recent entries</h4>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job</TableHead>
                <TableHead className="text-center">Leads</TableHead>
                <TableHead className="text-center">Closed</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-center">Energy</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.slice(0, 15).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs">{e.entry_date}</TableCell>
                  <TableCell className="text-xs truncate max-w-[140px]">{e.job_name || "—"}</TableCell>
                  <TableCell className="text-center">{e.new_leads}</TableCell>
                  <TableCell className="text-center">{e.orders_closed}</TableCell>
                  <TableCell className="text-right font-mono">{Number(e.revenue_closed).toLocaleString()}</TableCell>
                  <TableCell className="text-center text-xs">{e.energy_level || "—"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => remove(e.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-4">No entries yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SalesTrackerTab;
