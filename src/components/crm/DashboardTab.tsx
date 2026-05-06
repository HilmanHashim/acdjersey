import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MONTHLY_TARGET = 55000;

// Salespeople in display order; key = sheet name in DB
const PEOPLE: { key: string; label: string }[] = [
  { key: "MUNIR", label: "🧢 Munir" },
  { key: "DIDO", label: "📣 Dido" },
  { key: "JEED", label: "⚡ Najeed" },
  { key: "UMAR", label: "👑 Umar" },
  { key: "ALIFF", label: "🔧 Aliff" },
  { key: "HILMAN", label: "💻 Hilman" },
];

// Exact palette from Excel
const C = {
  bg: "#0C0C0E",
  panel: "#131316",
  panelAlt: "#1C1C21",
  panelStrong: "#252529",
  muted: "#55555E",
  text: "#F0F0F2",
  subtle: "#9999A8",
  yellow: "#F0FF44",
  yellowBright: "#FFFF00",
  green: "#2DDF8A",
  blue: "#4D9FFF",
  orange: "#FF5C3A",
  white: "#FFFFFF",
};

type SalesEntry = {
  id: string;
  salesperson: string;
  entry_date: string;
  quantity: number | null;
  price_per_pc: number | null;
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

const agg = (rows: SalesEntry[]) =>
  rows.reduce(
    (a, r) => {
      a.leads += r.new_leads || 0;
      a.contacted += r.prospects_contacted || 0;
      a.quotes += r.quotations_sent || 0;
      a.closed += r.orders_closed || 0;
      a.revenue += Number(r.revenue_closed) || 0;
      a.pcs += r.quantity || 0;
      a.priceSum += Number(r.price_per_pc) || 0;
      a.priceCount += r.price_per_pc ? 1 : 0;
      return a;
    },
    { leads: 0, contacted: 0, quotes: 0, closed: 0, revenue: 0, pcs: 0, priceSum: 0, priceCount: 0 }
  );

const fmtMoney = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const DashboardTab = () => {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery<SalesEntry[]>({
    queryKey: ["sales_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_entries")
        .select("id,salesperson,entry_date,quantity,price_per_pc,new_leads,prospects_contacted,quotations_sent,orders_closed,revenue_closed,energy_level")
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

  const monthTotals = agg(monthRows);
  const pct = monthTotals.revenue / MONTHLY_TARGET;

  const todayPer = PEOPLE.map((p) => {
    const rows = todayRows.filter((r) => r.salesperson === p.key);
    const a = agg(rows);
    return {
      ...p,
      ...a,
      energy: rows[0]?.energy_level || "—",
      avgPrice: a.priceCount ? a.priceSum / a.priceCount : 0,
    };
  });
  const monthPer = PEOPLE.map((p) => {
    const rows = monthRows.filter((r) => r.salesperson === p.key);
    const a = agg(rows);
    return {
      ...p,
      ...a,
      closeRate: a.leads ? a.closed / a.leads : 0,
      avgPrice: a.priceCount ? a.priceSum / a.priceCount : 0,
    };
  });

  const todayTotals = agg(todayRows);

  return (
    <div className="rounded-xl p-4 md:p-6 space-y-6" style={{ background: C.bg }}>
      {/* TITLE */}
      <h2 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ color: C.yellow }}>
        ACD JERSEY — SALES DASHBOARD
      </h2>

      {/* MONTHLY TARGET PROGRESS */}
      <section>
        <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          📅  MONTHLY TARGET PROGRESS
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px" style={{ background: C.bg }}>
          {[
            { l: "MONTHLY TARGET", v: `RM ${fmtMoney(MONTHLY_TARGET)}`, color: C.subtle },
            { l: "TOTAL REVENUE", v: `RM ${fmtMoney(monthTotals.revenue)}`, color: C.yellow },
            { l: "% ACHIEVED", v: fmtPct(pct), color: C.green },
            { l: "ORDERS CLOSED", v: monthTotals.closed, color: C.blue },
            { l: "TOTAL LEADS", v: monthTotals.leads, color: C.text },
            { l: "DAYS LEFT IN MONTH", v: daysLeftInMonth(), color: C.orange },
          ].map((s) => (
            <div key={s.l}>
              <div className="px-3 py-2 text-[11px] font-bold tracking-wider"
                style={{ background: C.panelAlt, color: C.muted }}>{s.l}</div>
              <div className="px-3 py-3 text-lg font-bold"
                style={{ background: C.panelStrong, color: s.color }}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 w-full rounded-full overflow-hidden" style={{ background: C.panelAlt }}>
          <div className="h-full transition-all"
            style={{ width: `${Math.min(100, pct * 100)}%`, background: `linear-gradient(90deg, ${C.yellow}, ${C.green})` }} />
        </div>
      </section>

      {/* TEAM PERFORMANCE — TODAY */}
      <section>
        <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          👤  TEAM PERFORMANCE — TODAY
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse [&_td]:border [&_th]:border" style={{ borderColor: "#2A2A30" }}>
            <thead>
              <tr>
                {["NAME","LEADS","CONTACTED","QUOTES SENT","CLOSED","REVENUE (RM)","ENERGY","AVG PRICE PER PC","TOTAL PCS"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-bold text-xs tracking-wider border"
                    style={{ background: C.yellow, color: "#000", borderColor: "#2A2A30" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayPer.map((p, i) => (
                <tr key={p.key} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.label}</td>
                  <td className="px-3 py-2 border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.leads}</td>
                  <td className="px-3 py-2 border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.contacted}</td>
                  <td className="px-3 py-2 border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.quotes}</td>
                  <td className="px-3 py-2 border" style={{ color: C.green, borderColor: "#2A2A30" }}>{p.closed}</td>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.yellowBright, borderColor: "#2A2A30" }}>{fmtMoney(p.revenue)}</td>
                  <td className="px-3 py-2 text-xs border" style={{ color: C.subtle, borderColor: "#2A2A30" }}>{p.energy}</td>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.avgPrice ? p.avgPrice.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2 border" style={{ color: C.white, borderColor: "#2A2A30" }}>{p.pcs}</td>
                </tr>
              ))}
              <tr style={{ background: C.panelStrong }}>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>TOTAL</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{todayTotals.leads}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{todayTotals.contacted}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{todayTotals.quotes}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{todayTotals.closed}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{fmtMoney(todayTotals.revenue)}</td>
                <td className="px-3 py-2" style={{ color: C.subtle, border: `2px solid ${C.yellow}` }}>—</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>
                  {todayTotals.priceCount ? (todayTotals.priceSum / todayTotals.priceCount).toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 font-bold" style={{ color: C.white, border: `2px solid ${C.yellow}` }}>{todayTotals.pcs}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* MONTH CUMULATIVE — INDIVIDUAL */}
      <section>
        <div className="px-3 py-2 rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          📈  MONTH CUMULATIVE — INDIVIDUAL
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse [&_td]:border [&_th]:border" style={{ borderColor: "#2A2A30" }}>
            <thead>
              <tr>
                {["NAME","LEADS","CONTACTED","QUOTES","CLOSED","REVENUE (RM)","CLOSE RATE","TOTAL AVG PRICE PC","ALL TOTAL PCS"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-bold text-xs tracking-wider border"
                    style={{ background: C.yellow, color: "#000", borderColor: "#2A2A30" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthPer.map((p, i) => (
                <tr key={p.key} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.label}</td>
                  <td className="px-3 py-2 border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.leads}</td>
                  <td className="px-3 py-2 border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.contacted}</td>
                  <td className="px-3 py-2 border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.quotes}</td>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.green, borderColor: "#2A2A30" }}>{p.closed}</td>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.yellowBright, borderColor: "#2A2A30" }}>{fmtMoney(p.revenue)}</td>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.blue, borderColor: "#2A2A30" }}>{fmtPct(p.closeRate)}</td>
                  <td className="px-3 py-2 font-bold border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.avgPrice ? p.avgPrice.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2 border" style={{ color: C.white, borderColor: "#2A2A30" }}>{p.pcs}</td>
                </tr>
              ))}
              <tr style={{ background: C.panelStrong }}>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>TOTAL</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{monthTotals.leads}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{monthTotals.contacted}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{monthTotals.quotes}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{monthTotals.closed}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>{fmtMoney(monthTotals.revenue)}</td>
                <td className="px-3 py-2 font-bold" style={{ color: C.blue, border: `2px solid ${C.yellow}` }}>
                  {monthTotals.leads ? fmtPct(monthTotals.closed / monthTotals.leads) : "0.0%"}
                </td>
                <td className="px-3 py-2 font-bold" style={{ color: C.yellow, border: `2px solid ${C.yellow}` }}>
                  {monthTotals.priceCount ? (monthTotals.priceSum / monthTotals.priceCount).toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 font-bold" style={{ color: C.white, border: `2px solid ${C.yellow}` }}>{monthTotals.pcs}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardTab;
