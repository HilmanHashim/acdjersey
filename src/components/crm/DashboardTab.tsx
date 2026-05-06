import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MONTHLY_TARGET = 55000;
const FIRST_MONTH = { year: 2026, month: 4 }; // April 2026 — first tracked month
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Salespeople in display order; key = sheet name in DB
const PEOPLE: { key: string; label: string }[] = [
  { key: "MUNIR ACD", label: "🧢 Munir" },
  { key: "DIDO ACD", label: "📣 Dido" },
  { key: "JEED ACD", label: "⚡ Najeed" },
  { key: "UMAR ACD", label: "👑 Umar" },
  { key: "ALYPH ACD", label: "🔧 Alyph" },
  { key: "HILMAN ACD", label: "💻 Hilman" },
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

const TOTAL_BORDER = `2px solid ${C.yellow}`;

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
        <div className="flex items-center justify-between px-3 py-2 rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          <span>📅  MONTHLY TARGET PROGRESS</span>
          <span style={{ color: C.yellow }}>{fmtPct(pct)} of target</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-3 rounded-b-md"
          style={{ background: C.panel }}>
          {[
            { l: "MONTHLY TARGET", v: `RM ${fmtMoney(MONTHLY_TARGET)}`, color: C.subtle, icon: "🎯" },
            { l: "TOTAL REVENUE", v: `RM ${fmtMoney(monthTotals.revenue)}`, color: C.yellow, icon: "💰" },
            { l: "% ACHIEVED", v: fmtPct(pct), color: C.green, icon: "📈" },
            { l: "ORDERS CLOSED", v: monthTotals.closed, color: C.blue, icon: "✅" },
            { l: "TOTAL LEADS", v: monthTotals.leads, color: C.text, icon: "👥" },
            { l: "DAYS LEFT IN MONTH", v: daysLeftInMonth(), color: C.orange, icon: "⏳" },
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
            <span style={{ color: C.text }}>RM {fmtMoney(monthTotals.revenue)} / RM {fmtMoney(MONTHLY_TARGET)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: C.panelAlt }}>
            <div className="h-full transition-all rounded-full"
              style={{ width: `${Math.min(100, pct * 100)}%`, background: `linear-gradient(90deg, ${C.yellow}, ${C.green})` }} />
          </div>
        </div>
      </section>

      {/* TEAM PERFORMANCE — TODAY */}
      <section>
        <div className="px-3 py-2 whitespace-nowrap rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          👤  TEAM PERFORMANCE — TODAY
        </div>
        <div className="overflow-hidden">
          <table className="w-full table-auto text-sm border-separate border-spacing-0 [&_td]:border [&_th]:border" style={{ borderColor: "#2A2A30" }}>
            <thead>
              <tr>
                {["NAME","LEADS","CONTACTED","QUOTES SENT","CLOSED","REVENUE (RM)","ENERGY","AVG PRICE PER PC","TOTAL PCS"].map((h) => (
                  <th key={h} className="px-3 py-2 whitespace-nowrap text-left font-bold text-xs tracking-wider border"
                    style={{ background: C.yellow, color: "#000", borderColor: "#2A2A30" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayPer.map((p, i) => (
                <tr key={p.key} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.label}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.leads}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.contacted}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.quotes}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.green, borderColor: "#2A2A30" }}>{p.closed}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.yellowBright, borderColor: "#2A2A30" }}>{fmtMoney(p.revenue)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs border" style={{ color: C.subtle, borderColor: "#2A2A30" }}>{p.energy}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.avgPrice ? p.avgPrice.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.white, borderColor: "#2A2A30" }}>{p.pcs}</td>
                </tr>
              ))}
              <tr style={{ background: C.panelStrong }}>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>TOTAL</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.leads}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.contacted}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.quotes}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.closed}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{fmtMoney(todayTotals.revenue)}</td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: C.subtle, border: TOTAL_BORDER }}>—</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>
                  {todayTotals.priceCount ? (todayTotals.priceSum / todayTotals.priceCount).toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.white, border: TOTAL_BORDER }}>{todayTotals.pcs}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* MONTH CUMULATIVE — INDIVIDUAL */}
      <section>
        <div className="px-3 py-2 whitespace-nowrap rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          📈  MONTH CUMULATIVE — INDIVIDUAL
        </div>
        <div className="overflow-hidden">
          <table className="w-full table-auto text-sm border-separate border-spacing-0 [&_td]:border [&_th]:border" style={{ borderColor: "#2A2A30" }}>
            <thead>
              <tr>
                {["NAME","LEADS","CONTACTED","QUOTES","CLOSED","REVENUE (RM)","CLOSE RATE","TOTAL AVG PRICE PC","ALL TOTAL PCS"].map((h) => (
                  <th key={h} className="px-3 py-2 whitespace-nowrap text-left font-bold text-xs tracking-wider border"
                    style={{ background: C.yellow, color: "#000", borderColor: "#2A2A30" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthPer.map((p, i) => (
                <tr key={p.key} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.label}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.leads}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.contacted}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.quotes}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.green, borderColor: "#2A2A30" }}>{p.closed}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.yellowBright, borderColor: "#2A2A30" }}>{fmtMoney(p.revenue)}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.blue, borderColor: "#2A2A30" }}>{fmtPct(p.closeRate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.avgPrice ? p.avgPrice.toFixed(2) : "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.white, borderColor: "#2A2A30" }}>{p.pcs}</td>
                </tr>
              ))}
              <tr style={{ background: C.panelStrong }}>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>TOTAL</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.leads}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.contacted}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.quotes}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.closed}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{fmtMoney(monthTotals.revenue)}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.blue, border: TOTAL_BORDER }}>
                  {monthTotals.leads ? fmtPct(monthTotals.closed / monthTotals.leads) : "0.0%"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>
                  {monthTotals.priceCount ? (monthTotals.priceSum / monthTotals.priceCount).toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.white, border: TOTAL_BORDER }}>{monthTotals.pcs}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardTab;
