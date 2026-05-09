import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const SALESPEOPLE = ["JEED ACD", "DIDO ACD", "MUNIR ACD", "ALYPH ACD", "HILMAN ACD", "UMAR ACD"] as const;
const ENERGY_LEVELS = ["🔥 On Fire", "💪🏻 Bring it on", "✊🏻 All Good", "😐 Tough day", "😔 Struggling"];
const LEAD_OUTCOMES = ["Pending", "Bought", "Not Bought"] as const;

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
  lead_outcome: string | null;
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

  return (
    <div className="space-y-6">
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
    lead_outcome: "Pending",
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
      lead_outcome: form.lead_outcome || null,
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
      activity_today: "", lead_outcome: "Pending",
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
          <label className="text-xs text-muted-foreground">Job / Client Name</label>
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
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Lead Outcome (did they buy?)</label>
          <Select value={form.lead_outcome} onValueChange={(v) => update("lead_outcome", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={submit} variant="hero" className="gap-2">
        <Plus className="h-4 w-4" /> Add Entry
      </Button>

      <RecentEntries entries={entries} onRemove={remove} />
    </div>
  );
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const FIRST_MONTH = { year: 2026, month: 4 };

const RecentEntries = ({ entries, onRemove }: { entries: SalesEntry[]; onRemove: (id: string) => void }) => {
  const monthOptions = (() => {
    const now = new Date();
    const out: { value: string; label: string }[] = [];
    let y = FIRST_MONTH.year, m = FIRST_MONTH.month;
    const ny = now.getFullYear(), nm = now.getMonth() + 1;
    while (y < ny || (y === ny && m <= nm)) {
      out.push({ value: `${y}-${String(m).padStart(2,"0")}`, label: `${MONTH_NAMES[m-1]} ${y}` });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out.reverse();
  })();

  const [month, setMonth] = useState<string>(monthOptions[0]?.value || "");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const filtered = entries.filter((e) => e.entry_date.startsWith(month));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // reset to page 1 when filter/page-size changes
  useEffect(() => { setPage(1); }, [month, pageSize]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold">Recent entries</h4>
        <div className="flex items-center gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[900px] w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="min-w-[160px]">Job / Client</TableHead>
              <TableHead className="text-center w-[70px]">Leads</TableHead>
              <TableHead className="text-center w-[70px]">Closed</TableHead>
              <TableHead className="text-right w-[140px]">Revenue (RM)</TableHead>
              <TableHead className="text-center w-[140px]">Outcome</TableHead>
              <TableHead className="text-center w-[120px]">Energy</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs">{e.entry_date}</TableCell>
                <TableCell className="text-xs truncate max-w-[140px]">{e.job_name || "—"}</TableCell>
                <TableCell className="text-center">{e.new_leads}</TableCell>
                <TableCell className="text-center">{e.orders_closed}</TableCell>
                <TableCell className="text-right font-mono">RM {Number(e.revenue_closed).toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <OutcomeCell entry={e} />
                </TableCell>
                <TableCell className="text-center text-xs">{e.energy_level || "—"}</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => onRemove(e.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-4">No entries for this month</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>
          {filtered.length === 0 ? "0 entries" : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Prev</Button>
          <span className="px-2">Page {safePage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default SalesTrackerTab;

const OutcomeCell = ({ entry }: { entry: SalesEntry }) => {
  const qc = useQueryClient();
  const value = entry.lead_outcome || "Pending";
  const color =
    value === "Bought" ? "text-green-500" :
    value === "Not Bought" ? "text-red-500" :
    "text-muted-foreground";
  const onChange = async (v: string) => {
    const { error } = await supabase.from("sales_entries").update({ lead_outcome: v }).eq("id", entry.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["sales_entries"] });
  };
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-7 w-[110px] text-xs mx-auto ${color}`}><SelectValue /></SelectTrigger>
      <SelectContent>
        {LEAD_OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
};
