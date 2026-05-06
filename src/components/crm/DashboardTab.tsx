import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const DEFAULT_TARGET = 50000;
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
const pad2 = (n: number) => String(n).padStart(2, "0");
const monthBounds = (y: number, m: number) => {
  const start = `${y}-${pad2(m)}-01`;
  const end = new Date(y, m, 0); // last day of month m (1-indexed)
  return { start, end: `${y}-${pad2(m)}-${pad2(end.getDate())}` };
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
const daysLeftInMonthFor = (y: number, m: number) => {
  const now = new Date();
  if (y !== now.getFullYear() || m !== now.getMonth() + 1) return 0;
  const last = new Date(y, m, 0).getDate();
  return last - now.getDate();
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
      // Weighted avg price = Σ(qty × price) / Σ(qty where price set)
      if (r.price_per_pc && r.quantity) {
        a.priceWeighted += Number(r.price_per_pc) * r.quantity;
        a.pcsForPrice += r.quantity;
      }
      return a;
    },
    { leads: 0, contacted: 0, quotes: 0, closed: 0, revenue: 0, pcs: 0, priceSum: 0, priceCount: 0, priceWeighted: 0, pcsForPrice: 0 }
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

  const { data: targets = [] } = useQuery<{ year: number; month: number; target_amount: number }[]>({
    queryKey: ["monthly_targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_targets")
        .select("year,month,target_amount");
      if (error) throw error;
      return (data || []) as any;
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("sales_entries_dashboard_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_entries" }, () => {
        qc.invalidateQueries({ queryKey: ["sales_entries"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "monthly_targets" }, () => {
        qc.invalidateQueries({ queryKey: ["monthly_targets"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selected, setSelected] = useState<string>(monthOptions[monthOptions.length - 1]?.value || "");
  const sel = monthOptions.find((m) => m.value === selected) || monthOptions[monthOptions.length - 1];
  const { start: mStart, end: mEnd } = monthBounds(sel.year, sel.month);
  const today = todayISO();
  const now = new Date();
  const isCurrentMonth = sel.year === now.getFullYear() && sel.month === now.getMonth() + 1;

  const monthlyTarget = useMemo(() => {
    const t = targets.find((x) => x.year === sel.year && x.month === sel.month);
    return t ? Number(t.target_amount) : DEFAULT_TARGET;
  }, [targets, sel.year, sel.month]);

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const saveTarget = async () => {
    const val = Number(targetDraft);
    if (!Number.isFinite(val) || val < 0) { setEditingTarget(false); return; }
    const { error } = await supabase
      .from("monthly_targets")
      .upsert({ year: sel.year, month: sel.month, target_amount: val }, { onConflict: "year,month" });
    if (!error) qc.invalidateQueries({ queryKey: ["monthly_targets"] });
    setEditingTarget(false);
  };

  const monthRows = useMemo(
    () => entries.filter((e) => e.entry_date >= mStart && e.entry_date <= mEnd),
    [entries, mStart, mEnd]
  );
  const focusDate = useMemo(() => {
    if (isCurrentMonth) return today;
    const dates = monthRows.map((r) => r.entry_date).sort();
    return dates[dates.length - 1] || mEnd;
  }, [isCurrentMonth, today, monthRows, mEnd]);
  const todayRows = useMemo(() => monthRows.filter((e) => e.entry_date === focusDate), [monthRows, focusDate]);

  const monthTotals = agg(monthRows);
  const pct = monthlyTarget > 0 ? monthTotals.revenue / monthlyTarget : 0;

  const todayPer = PEOPLE.map((p) => {
    const rows = todayRows.filter((r) => r.salesperson === p.key);
    const a = agg(rows);
    return {
      ...p,
      ...a,
      energy: rows[0]?.energy_level || "—",
      avgPrice: a.pcsForPrice ? a.priceWeighted / a.pcsForPrice : 0,
    };
  });
  const monthPer = PEOPLE.map((p) => {
    const rows = monthRows.filter((r) => r.salesperson === p.key);
    const a = agg(rows);
    return {
      ...p,
      ...a,
      closeRate: a.leads ? a.closed / a.leads : 0,
      avgPrice: a.pcsForPrice ? a.priceWeighted / a.pcsForPrice : 0,
    };
  });

  const todayTotals = agg(todayRows);

  return (
    <div className="rounded-xl p-4 md:p-6 space-y-6" style={{ background: C.bg }}>
      {/* TITLE + MONTH SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ color: C.yellow }}>
          ACD JERSEY — SALES DASHBOARD
        </h2>
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

      {/* MONTHLY TARGET PROGRESS */}
      <section>
        <div className="flex items-center justify-between px-3 py-2 rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          <span>📅  MONTHLY TARGET PROGRESS</span>
          <span style={{ color: C.yellow }}>{fmtPct(pct)} of target</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-3 rounded-b-md"
          style={{ background: C.panel }}>
          {/* Editable Monthly Target card */}
          <div className="rounded-lg p-3 transition-transform hover:scale-[1.02]"
            style={{ background: C.panelStrong, borderLeft: `3px solid ${C.subtle}` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>MONTHLY TARGET</div>
              <span className="text-sm opacity-70">🎯</span>
            </div>
            {editingTarget ? (
              <input
                autoFocus
                type="number"
                value={targetDraft}
                onChange={(e) => setTargetDraft(e.target.value)}
                onBlur={saveTarget}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTarget();
                  if (e.key === "Escape") setEditingTarget(false);
                }}
                className="w-full bg-transparent text-xl font-bold leading-tight focus:outline-none"
                style={{ color: C.subtle, borderBottom: `1px solid ${C.yellow}` }}
              />
            ) : (
              <button
                onClick={() => { setTargetDraft(String(monthlyTarget)); setEditingTarget(true); }}
                title="Click to edit monthly target"
                className="text-xl font-bold leading-tight text-left w-full hover:opacity-80"
                style={{ color: C.subtle }}
              >
                RM {fmtMoney(monthlyTarget)} <span className="text-[10px] opacity-60">✏️</span>
              </button>
            )}
          </div>
          {[
            { l: "TOTAL REVENUE", v: `RM ${fmtMoney(monthTotals.revenue)}`, color: C.yellow, icon: "💰" },
            { l: "% ACHIEVED", v: fmtPct(pct), color: C.green, icon: "📈" },
            { l: "ORDERS CLOSED", v: monthTotals.closed, color: C.blue, icon: "✅" },
            { l: "TOTAL LEADS", v: monthTotals.leads, color: C.text, icon: "👥" },
            { l: "DAYS LEFT IN MONTH", v: daysLeftInMonthFor(sel.year, sel.month), color: C.orange, icon: "⏳" },
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
            <span style={{ color: C.text }}>RM {fmtMoney(monthTotals.revenue)} / RM {fmtMoney(monthlyTarget)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden relative" style={{ background: C.panelAlt }}>
            <div className="h-full transition-all rounded-full relative overflow-hidden"
              style={{ width: `${Math.min(100, pct * 100)}%`, background: `linear-gradient(90deg, ${C.yellow}, ${C.green})` }}>
              <div className="absolute inset-0 progress-sheen" />
            </div>
          </div>
          <style>{`
            @keyframes progressSheen {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .progress-sheen {
              background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%);
              animation: progressSheen 1.8s linear infinite;
            }
          `}</style>
        </div>
      </section>

      {/* TEAM PERFORMANCE — TODAY / focus day */}
      <section>
        <div className="px-3 py-2 whitespace-nowrap rounded-t-md text-xs font-bold tracking-widest"
          style={{ background: C.panel, color: C.muted }}>
          👤  TEAM PERFORMANCE — {isCurrentMonth ? "TODAY" : focusDate.toUpperCase()}
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
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.yellowBright, borderColor: "#2A2A30" }}>RM {fmtMoney(p.revenue)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs border" style={{ color: C.subtle, borderColor: "#2A2A30" }}>{p.energy}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-bold border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.avgPrice ? `RM ${p.avgPrice.toFixed(2)}` : "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap border" style={{ color: C.white, borderColor: "#2A2A30" }}>{p.pcs}</td>
                </tr>
              ))}
              <tr style={{ background: C.panelStrong }}>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>TOTAL</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.leads}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.contacted}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.quotes}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{todayTotals.closed}</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>RM {fmtMoney(todayTotals.revenue)}</td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: C.subtle, border: TOTAL_BORDER }}>—</td>
                <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>
                  {todayTotals.pcsForPrice ? `RM ${(todayTotals.priceWeighted / todayTotals.pcsForPrice).toFixed(2)}` : "—"}
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
          <table className="w-full table-fixed text-sm border-separate border-spacing-0 [&_td]:border [&_th]:border" style={{ borderColor: "#2A2A30" }}>
            <thead>
              <tr>
                {[
                  { h: "NAME", w: "12%" },
                  { h: "LEADS", w: "7%" },
                  { h: "CONTACTED", w: "9%" },
                  { h: "QUOTES", w: "7%" },
                  { h: "CLOSED", w: "7%" },
                  { h: "REVENUE (RM)", w: "12%" },
                  { h: "CLOSE RATE", w: "9%" },
                  { h: "AVG PRICE/PC", w: "11%" },
                  { h: "TOTAL PCS", w: "8%" },
                  { h: "CONTRIB %", w: "9%" },
                ].map((c) => (
                  <th key={c.h} style={{ width: c.w, background: C.yellow, color: "#000", borderColor: "#2A2A30" }}
                    className="px-2 py-2 text-left font-bold text-[11px] tracking-wider border">{c.h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthPer.map((p, i) => {
                const contrib = monthTotals.revenue > 0 ? p.revenue / monthTotals.revenue : 0;
                return (
                <tr key={p.key} style={{ background: i % 2 === 0 ? C.panel : C.panelAlt }}>
                  <td className="px-2 py-2 truncate font-bold border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.label}</td>
                  <td className="px-2 py-2 border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.leads}</td>
                  <td className="px-2 py-2 border" style={{ color: C.text, borderColor: "#2A2A30" }}>{p.contacted}</td>
                  <td className="px-2 py-2 border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.quotes}</td>
                  <td className="px-2 py-2 font-bold border" style={{ color: C.green, borderColor: "#2A2A30" }}>{p.closed}</td>
                  <td className="px-2 py-2 font-bold border" style={{ color: C.yellowBright, borderColor: "#2A2A30" }}>RM {fmtMoney(p.revenue)}</td>
                  <td className="px-2 py-2 font-bold border" style={{ color: C.blue, borderColor: "#2A2A30" }}>{fmtPct(p.closeRate)}</td>
                  <td className="px-2 py-2 font-bold border" style={{ color: C.yellow, borderColor: "#2A2A30" }}>{p.avgPrice ? `RM ${p.avgPrice.toFixed(2)}` : "—"}</td>
                  <td className="px-2 py-2 border" style={{ color: C.white, borderColor: "#2A2A30" }}>{p.pcs}</td>
                  <td className="px-2 py-2 font-bold border" style={{ color: C.green, borderColor: "#2A2A30" }}>{fmtPct(contrib)}</td>
                </tr>
                );
              })}
              <tr style={{ background: C.panelStrong }}>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>TOTAL</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.leads}</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.contacted}</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.quotes}</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>{monthTotals.closed}</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>RM {fmtMoney(monthTotals.revenue)}</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.blue, border: TOTAL_BORDER }}>
                  {monthTotals.leads ? fmtPct(monthTotals.closed / monthTotals.leads) : "0.0%"}
                </td>
                <td className="px-2 py-2 font-bold" style={{ color: C.yellow, border: TOTAL_BORDER }}>
                  {monthTotals.pcsForPrice ? `RM ${(monthTotals.priceWeighted / monthTotals.pcsForPrice).toFixed(2)}` : "—"}
                </td>
                <td className="px-2 py-2 font-bold" style={{ color: C.white, border: TOTAL_BORDER }}>{monthTotals.pcs}</td>
                <td className="px-2 py-2 font-bold" style={{ color: C.green, border: TOTAL_BORDER }}>100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardTab;
