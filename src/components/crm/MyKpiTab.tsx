import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "@/hooks/use-toast";
import { Pencil, Check, X } from "lucide-react";

const SALESPEOPLE_KEYS = ["MUNIR ACD", "DIDO ACD", "JEED ACD", "UMAR ACD", "ALYPH ACD", "HILMAN ACD"] as const;
const PEOPLE_LABEL: Record<string, string> = {
  "MUNIR ACD": "🧢 Munir",
  "DIDO ACD": "📣 Dido",
  "JEED ACD": "⚡ Najeed",
  "UMAR ACD": "👑 Umar",
  "ALYPH ACD": "🔧 Alyph",
  "HILMAN ACD": "💻 Hilman",
};
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const FIRST_MONTH = { year: 2026, month: 4 };
const DEFAULT_TARGET = 50000;
const TEAM_SIZE = 6;

const C = {
  bg: "hsl(220 25% 6%)",
  panel: "hsl(220 22% 12%)",
  panelAlt: "hsl(220 20% 17%)",
  panelStrong: "hsl(220 22% 22%)",
  muted: "hsl(220 12% 72%)",
  text: "hsl(0 0% 98%)",
  subtle: "hsl(220 12% 82%)",
  yellow: "hsl(35 95% 62%)",
  yellowBright: "hsl(40 100% 70%)",
  green: "hsl(142 70% 55%)",
  blue: "hsl(210 90% 70%)",
  orange: "hsl(0 75% 58%)",
  white: "hsl(0 0% 100%)",
};
const HERO_GRADIENT = "linear-gradient(135deg, hsl(0 65% 42%), hsl(30 70% 50%))";
const BORDER_COL = "hsl(220 18% 28%)";

const pad2 = (n: number) => String(n).padStart(2, "0");
const monthBounds = (y: number, m: number) => {
  const last = new Date(y, m, 0).getDate();
  return { start: `${y}-${pad2(m)}-01`, end: `${y}-${pad2(m)}-${pad2(last)}`, lastDay: last };
};
const buildMonthOptions = () => {
  const now = new Date();
  const out: { year: number; month: number; label: string; value: string }[] = [];
  let y = FIRST_MONTH.year, m = FIRST_MONTH.month;
  const ny = now.getFullYear(), nm = now.getMonth() + 1;
  while (y < ny || (y === ny && m <= nm)) {
    out.push({ year: y, month: m, label: `${MONTH_NAMES[m - 1]} ${y}`, value: `${y}-${pad2(m)}` });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
};
const fmtMoney = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const daysLeftInMonthFor = (y: number, m: number) => {
  const now = new Date();
  if (y !== now.getFullYear() || m !== now.getMonth() + 1) return 0;
  const last = new Date(y, m, 0).getDate();
  return last - now.getDate();
};

type SalesEntry = {
  id: string;
  salesperson: string;
  entry_date: string;
  job_name: string | null;
  quantity: number | null;
  price_per_pc: number | null;
  new_leads: number;
  prospects_contacted: number;
  quotations_sent: number;
  orders_closed: number;
  revenue_closed: number;
  energy_level: string | null;
};

const MyKpiTab = () => {
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? "");
    });
  }, []);

  // current user's role
  const { data: roles = [] } = useQuery({
    queryKey: ["my-roles", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      if (error) throw error;
      return (data || []).map((r) => r.role as string);
    },
  });
  const isAdmin = roles.includes("admin") || roles.includes("superadmin");

  // all profiles (for admin dropdown + own profile lookup)
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id,display_name,salesperson_key");
      if (error) throw error;
      return data || [];
    },
  });

  const myProfile = useMemo(() => profiles.find((p: any) => p.user_id === userId), [profiles, userId]);
  const myKey: string | null = myProfile?.salesperson_key ?? null;

  // selected salesperson: admins can switch, others locked to own
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedKey && myKey) setSelectedKey(myKey);
    else if (!selectedKey && isAdmin) setSelectedKey(SALESPEOPLE_KEYS[0]);
  }, [myKey, isAdmin, selectedKey]);

  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selected, setSelected] = useState<string>(monthOptions[monthOptions.length - 1]?.value || "");
  const sel = monthOptions.find((m) => m.value === selected) || monthOptions[monthOptions.length - 1];
  const { start: mStart, end: mEnd, lastDay } = monthBounds(sel.year, sel.month);

  // sales entries for the selected person + month
  const { data: entries = [] } = useQuery<SalesEntry[]>({
    queryKey: ["sales_entries_kpi", selectedKey, mStart, mEnd],
    enabled: !!selectedKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_entries")
        .select("id,salesperson,entry_date,job_name,quantity,price_per_pc,new_leads,prospects_contacted,quotations_sent,orders_closed,revenue_closed,energy_level")
        .eq("salesperson", selectedKey!)
        .gte("entry_date", mStart)
        .lte("entry_date", mEnd)
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return (data || []) as SalesEntry[];
    },
  });

  // resolve which user owns the selected salesperson key
  const selectedProfile = useMemo(
    () => profiles.find((p: any) => p.salesperson_key === selectedKey),
    [profiles, selectedKey]
  );
  const selectedUserId: string | null = selectedProfile?.user_id ?? null;

  // personal target for selected user + month (editable per user)
  const { data: personalTargetRow } = useQuery({
    queryKey: ["personal_target", selectedUserId, sel.year, sel.month],
    enabled: !!selectedUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personal_targets")
        .select("id,user_id,year,month,target_amount")
        .eq("user_id", selectedUserId!)
        .eq("year", sel.year)
        .eq("month", sel.month)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const personalTarget = personalTargetRow ? Number(personalTargetRow.target_amount) : 0;
  const canEditTarget = !!selectedUserId && (selectedUserId === userId || isAdmin);

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState<string>("");
  useEffect(() => {
    setTargetDraft(String(personalTarget || ""));
    setEditingTarget(false);
  }, [personalTarget, selectedUserId, sel.year, sel.month]);

  const saveTarget = async () => {
    if (!selectedUserId) return;
    const amt = Number(targetDraft);
    if (!Number.isFinite(amt) || amt < 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("personal_targets")
      .upsert(
        { user_id: selectedUserId, year: sel.year, month: sel.month, target_amount: amt },
        { onConflict: "user_id,year,month" }
      );
    if (error) {
      toast({ title: "Failed to save target", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Personal target saved" });
    setEditingTarget(false);
    qc.invalidateQueries({ queryKey: ["personal_target", selectedUserId, sel.year, sel.month] });
  };

  useEffect(() => {
    const ch = supabase
      .channel("my_kpi_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_entries" }, () => {
        qc.invalidateQueries({ queryKey: ["sales_entries_kpi"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  // aggregates
  const totals = useMemo(() => {
    return entries.reduce(
      (a, r) => {
        a.leads += r.new_leads || 0;
        a.contacted += r.prospects_contacted || 0;
        a.quotes += r.quotations_sent || 0;
        a.closed += r.orders_closed || 0;
        a.revenue += Number(r.revenue_closed) || 0;
        a.pcs += r.quantity || 0;
        if (r.price_per_pc && r.quantity) {
          a.priceWeighted += Number(r.price_per_pc) * r.quantity;
          a.pcsForPrice += r.quantity;
        }
        return a;
      },
      { leads: 0, contacted: 0, quotes: 0, closed: 0, revenue: 0, pcs: 0, priceWeighted: 0, pcsForPrice: 0 }
    );
  }, [entries]);

  const pct = personalTarget > 0 ? totals.revenue / personalTarget : 0;
  const avgPrice = totals.pcsForPrice ? totals.priceWeighted / totals.pcsForPrice : 0;
  const closeRate = totals.leads ? totals.closed / totals.leads : 0;

  // Daily trend
  const dailyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (let d = 1; d <= lastDay; d++) map.set(`${sel.year}-${pad2(sel.month)}-${pad2(d)}`, 0);
    entries.forEach((e) => map.set(e.entry_date, (map.get(e.entry_date) || 0) + Number(e.revenue_closed || 0)));
    return Array.from(map.entries()).map(([date, revenue]) => ({ day: Number(date.slice(-2)), revenue }));
  }, [entries, lastDay, sel.year, sel.month]);

  // Energy log (last 14 days that have entries)
  const energyLog = useMemo(() => {
    const seen = new Set<string>();
    const out: { date: string; energy: string }[] = [];
    for (const e of entries) {
      if (seen.has(e.entry_date)) continue;
      seen.add(e.entry_date);
      out.push({ date: e.entry_date, energy: e.energy_level || "—" });
      if (out.length >= 14) break;
    }
    return out;
  }, [entries]);

  if (!userId) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin && !myKey) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: C.bg, color: C.text }}>
        <h3 className="text-xl font-display mb-2">No salesperson linked yet</h3>
        <p className="text-sm" style={{ color: C.muted }}>
          Ask an admin to map <span className="font-mono">{userEmail}</span> to a salesperson in the Users tab.
        </p>
      </div>
    );
  }

  // available salespeople for admin dropdown
  const adminOptions = Array.from(new Set([
    ...SALESPEOPLE_KEYS,
    ...profiles.map((p: any) => p.salesperson_key).filter(Boolean),
  ])) as string[];

  return (
    <div className="rounded-xl p-4 md:p-6 space-y-6" style={{ background: C.bg }}>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-display tracking-wide text-gradient">
          MY KPI {selectedKey && <span className="text-sm font-normal" style={{ color: C.muted }}>· {PEOPLE_LABEL[selectedKey] || selectedKey}</span>}
        </h2>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <select
              value={selectedKey || ""}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="px-3 py-2 rounded-md text-sm font-bold tracking-wider focus:outline-none cursor-pointer"
              style={{ background: C.panelStrong, color: C.green, border: `1px solid ${C.green}` }}
            >
              {adminOptions.map((k) => (
                <option key={k} value={k} style={{ background: C.panelStrong, color: C.text }}>
                  {PEOPLE_LABEL[k] || k}
                </option>
              ))}
            </select>
          )}
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="px-3 py-2 rounded-md text-sm font-bold tracking-wider focus:outline-none cursor-pointer"
            style={{ background: C.panelStrong, color: C.yellow, border: `1px solid ${C.yellow}` }}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value} style={{ background: C.panelStrong, color: C.text }}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <section>
        <div className="flex items-center justify-between px-3 py-2 rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          <span>🎯  PERSONAL TARGET PROGRESS</span>
          <span style={{ color: C.yellow }}>{fmtPct(pct)} of personal target</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-3 rounded-b-md" style={{ background: C.panel }}>
          {[
            { l: "MY REVENUE", v: `RM ${fmtMoney(totals.revenue)}`, color: C.yellow, icon: "💰" },
            { l: "PERSONAL TARGET", v: `RM ${fmtMoney(personalTarget)}`, color: C.subtle, icon: "🎯" },
            { l: "% ACHIEVED", v: fmtPct(pct), color: C.green, icon: "📈" },
            { l: "ORDERS CLOSED", v: totals.closed, color: C.blue, icon: "✅" },
            { l: "TOTAL PCS", v: totals.pcs, color: C.text, icon: "👕" },
            { l: "AVG PRICE / PC", v: avgPrice ? `RM ${avgPrice.toFixed(2)}` : "—", color: C.yellowBright, icon: "🏷️" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg p-3 transition-transform hover:scale-[1.02]"
              style={{ background: C.panelStrong, borderLeft: `3px solid ${s.color}` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>{s.l}</div>
                <span className="text-sm opacity-70">{s.icon}</span>
              </div>
              <div className="text-xl font-bold leading-tight" style={{ color: s.color }}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>
            <span>PROGRESS</span>
            <span style={{ color: C.text }}>RM {fmtMoney(totals.revenue)} / RM {fmtMoney(personalTarget)} · {daysLeftInMonthFor(sel.year, sel.month)} days left</span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: C.panelAlt }}>
            <div className="h-full transition-all rounded-full"
              style={{ width: `${Math.min(100, pct * 100)}%`, background: HERO_GRADIENT }} />
          </div>
        </div>
      </section>

      {/* FUNNEL */}
      <section>
        <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest" style={{ background: C.panel, color: C.muted }}>
          🪣  CONVERSION FUNNEL
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-b-md" style={{ background: C.panel }}>
          {[
            { l: "LEADS", v: totals.leads, color: C.text },
            { l: "CONTACTED", v: totals.contacted, color: C.blue, conv: totals.leads ? totals.contacted / totals.leads : 0 },
            { l: "QUOTES", v: totals.quotes, color: C.yellow, conv: totals.contacted ? totals.quotes / totals.contacted : 0 },
            { l: "CLOSED", v: totals.closed, color: C.green, conv: totals.quotes ? totals.closed / totals.quotes : 0 },
            { l: "CLOSE RATE", v: fmtPct(closeRate), color: C.yellowBright, hint: "closed / leads" },
          ].map((s: any) => (
            <div key={s.l} className="rounded-lg p-3" style={{ background: C.panelStrong, borderLeft: `3px solid ${s.color}` }}>
              <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: C.muted }}>{s.l}</div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.v}</div>
              {s.conv !== undefined && (
                <div className="text-[10px] mt-1" style={{ color: C.muted }}>↳ {fmtPct(s.conv)} from prev</div>
              )}
              {s.hint && <div className="text-[10px] mt-1" style={{ color: C.muted }}>{s.hint}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* DAILY REVENUE CHART */}
      <section>
        <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest" style={{ background: C.panel, color: C.muted }}>
          📊  DAILY REVENUE TREND
        </div>
        <div className="p-3 rounded-b-md" style={{ background: C.panel }}>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={dailyTrend} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={BORDER_COL} strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke={C.muted} fontSize={11} />
                <YAxis stroke={C.muted} fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: C.panelStrong, border: `1px solid ${BORDER_COL}`, color: C.text }}
                  formatter={(v: any) => [`RM ${fmtMoney(Number(v))}`, "Revenue"]}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Line type="monotone" dataKey="revenue" stroke={C.yellow} strokeWidth={2.5} dot={{ r: 3, fill: C.yellow }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ENERGY + RECENT ENTRIES */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest" style={{ background: C.panel, color: C.muted }}>
            ⚡  ENERGY LOG
          </div>
          <div className="rounded-b-md overflow-hidden" style={{ background: C.panel }}>
            <table className="w-full text-sm">
              <tbody>
                {energyLog.length === 0 && (
                  <tr><td className="px-3 py-3 text-xs" style={{ color: C.muted }}>No entries yet.</td></tr>
                )}
                {energyLog.map((e, i) => (
                  <tr key={e.date} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                    <td className="px-3 py-2 text-xs" style={{ color: C.subtle }}>{e.date}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: C.text }}>{e.energy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest" style={{ background: C.panel, color: C.muted }}>
            🗒️  RECENT ENTRIES
          </div>
          <div className="rounded-b-md overflow-x-auto" style={{ background: C.panel }}>
            <table className="w-full text-sm border-separate border-spacing-0 [&_td]:border [&_th]:border" style={{ borderColor: BORDER_COL }}>
              <thead>
                <tr>
                  {["DATE", "JOB", "QTY", "PRICE/PC", "REVENUE", "CLOSED"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs tracking-wider" style={{ background: HERO_GRADIENT, color: C.white, borderColor: BORDER_COL }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-4 text-center text-xs" style={{ color: C.muted, borderColor: BORDER_COL }}>No entries this month.</td></tr>
                )}
                {entries.slice(0, 20).map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                    <td className="px-3 py-2 text-xs" style={{ color: C.subtle, borderColor: BORDER_COL }}>{e.entry_date}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: C.text, borderColor: BORDER_COL }}>{e.job_name || "—"}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: C.text, borderColor: BORDER_COL }}>{e.quantity ?? "—"}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: C.yellow, borderColor: BORDER_COL }}>{e.price_per_pc ? `RM ${Number(e.price_per_pc).toFixed(2)}` : "—"}</td>
                    <td className="px-3 py-2 text-xs font-bold" style={{ color: C.yellowBright, borderColor: BORDER_COL }}>RM {fmtMoney(Number(e.revenue_closed) || 0)}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: C.green, borderColor: BORDER_COL }}>{e.orders_closed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyKpiTab;
