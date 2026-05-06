import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, TrendingUp, Users, DollarSign, Package, Flame, CalendarDays } from "lucide-react";

const SALESPEOPLE = ["JEED", "DIDO", "MUNIR", "ALIFF", "HILMAN", "UMAR"] as const;
const MONTHLY_TARGET = 55000;

type SalesEntry = {
  id: string;
  salesperson: string;
  entry_date: string;
  quantity: number | null;
  new_leads: number;
  prospects_contacted: number;
  quotations_sent: number;
  orders_closed: number;
  revenue_closed: number;
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

const aggregate = (rows: SalesEntry[]) =>
  rows.reduce(
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

const PERSON_COLORS: Record<string, string> = {
  JEED: "from-pink-500 to-rose-500",
  DIDO: "from-amber-500 to-orange-500",
  MUNIR: "from-emerald-500 to-teal-500",
  ALIFF: "from-sky-500 to-blue-500",
  HILMAN: "from-violet-500 to-purple-500",
  UMAR: "from-yellow-500 to-amber-500",
};

const DashboardTab = () => {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery<SalesEntry[]>({
    queryKey: ["sales_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_entries")
        .select("id,salesperson,entry_date,quantity,new_leads,prospects_contacted,quotations_sent,orders_closed,revenue_closed,energy_level")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return (data || []) as SalesEntry[];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("sales_entries_dashboard_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_entries" }, () => {
        qc.invalidateQueries({ queryKey: ["sales_entries"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const today = todayISO();
  const mStart = monthStart();
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
      {/* Hero target progress */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Monthly Target Progress</p>
              <h2 className="text-3xl font-display font-bold mt-1">RM {monthTotals.revenue.toLocaleString()} <span className="text-lg opacity-70">/ RM {MONTHLY_TARGET.toLocaleString()}</span></h2>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold font-display">{pctAchieved.toFixed(1)}%</p>
              <p className="text-xs opacity-80 mt-1">achieved</p>
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 via-emerald-300 to-cyan-300 transition-all shadow-lg"
              style={{ width: `${Math.min(100, pctAchieved)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <HeroStat icon={Package} label="Orders Closed" value={monthTotals.closed} />
            <HeroStat icon={Users} label="Total Leads" value={monthTotals.leads} />
            <HeroStat icon={TrendingUp} label="Quotes Sent" value={monthTotals.quotes} />
            <HeroStat icon={CalendarDays} label="Days Left" value={daysLeftInMonth()} />
          </div>
        </div>
      </Card>

      {/* Today */}
      <Card className="border-2 border-orange-200 dark:border-orange-900/40">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-lg">
          <CardTitle className="text-lg font-display flex items-center gap-2 text-white">
            <Flame className="h-5 w-5 text-white" /> Team Performance — Today
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <PerfTable rows={perPersonToday} showEnergy accent="orange" />
        </CardContent>
      </Card>

      {/* Month cumulative */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-900/40">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-lg">
          <CardTitle className="text-lg font-display flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-white" /> Month Cumulative — Individual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <PerfTable rows={perPersonMonth} accent="emerald" />
        </CardContent>
      </Card>
    </div>
  );
};

const HeroStat = ({ icon: Icon, label, value }: any) => (
  <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
    <Icon className="h-4 w-4 mb-1 opacity-80" />
    <p className="text-xs opacity-80">{label}</p>
    <p className="text-2xl font-bold font-display">{value}</p>
  </div>
);

const PerfTable = ({ rows, showEnergy, accent }: { rows: any[]; showEnergy?: boolean; accent: "orange" | "emerald" }) => {
  const headBg = accent === "orange"
    ? "bg-orange-600 hover:bg-orange-600"
    : "bg-emerald-600 hover:bg-emerald-600";
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className={headBg}>
            <TableHead className="font-bold text-white">Name</TableHead>
            <TableHead className="text-center font-bold text-white">Leads</TableHead>
            <TableHead className="text-center font-bold text-white">Contacted</TableHead>
            <TableHead className="text-center font-bold text-white">Quotes</TableHead>
            <TableHead className="text-center font-bold text-white">Closed</TableHead>
            <TableHead className="text-right font-bold text-white">Revenue (RM)</TableHead>
            <TableHead className="text-center font-bold text-white">Pcs</TableHead>
            {showEnergy && <TableHead className="font-bold text-white">Energy</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name} className="hover:bg-muted/40">
              <TableCell>
                <span className={`inline-block px-2.5 py-1 rounded-md text-white text-xs font-bold bg-gradient-to-r ${PERSON_COLORS[r.name] || "from-slate-500 to-slate-600"}`}>
                  {r.name}
                </span>
              </TableCell>
              <TableCell className="text-center font-medium text-blue-600 dark:text-blue-400">{r.leads}</TableCell>
              <TableCell className="text-center font-medium text-cyan-600 dark:text-cyan-400">{r.contacted}</TableCell>
              <TableCell className="text-center font-medium text-violet-600 dark:text-violet-400">{r.quotes}</TableCell>
              <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">{r.closed}</TableCell>
              <TableCell className="text-right font-mono font-bold text-amber-600 dark:text-amber-400">{r.revenue.toLocaleString()}</TableCell>
              <TableCell className="text-center font-medium text-pink-600 dark:text-pink-400">{r.pcs}</TableCell>
              {showEnergy && <TableCell className="text-xs">{r.energy}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DashboardTab;
