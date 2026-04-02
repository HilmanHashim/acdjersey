import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Upload, Search, Download, MessageCircle, Send, Settings } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Database } from "@/integrations/supabase/types";

type LeadStage = Database["public"]["Enums"]["lead_stage"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];

const stageBadge: Record<LeadStage, string> = {
  cold: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  prospect: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  first_buy: "bg-green-500/10 text-green-600 border-green-500/30",
};

const stageLabel: Record<LeadStage, string> = {
  cold: "Cold",
  prospect: "Prospect",
  first_buy: "First Buy",
};

const DEFAULT_TEMPLATE = `Salam ramadan bro! Saya Umar wakil dari ACD Jersey mengucapkan selamat menyambut puasa bro!

Semoga ramadan tahun ni lebih bermakna dari ramadan sebelum ini dan mengajar kita untuk jadi lebih baik sebagai seorang manusia.

Anyway broo, ni saya ada nak tanya pendapat sikit.

Kalau bulan puasa, better lari sebelum sahur ke lepas berbuka?

atau bulan puasa ni memang off dari running or any activity?`;

const getStoredTemplate = () => localStorage.getItem("wa_blast_template") || DEFAULT_TEMPLATE;

const LeadsTab = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [activeStage, setActiveStage] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [blastOpen, setBlastOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [blastMessage, setBlastMessage] = useState(getStoredTemplate);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(getStoredTemplate);
  const [form, setForm] = useState({
    phone: "", name: "", note: "", date: "", type_of_custom: "",
    leads_from: "", stage: "cold" as LeadStage, number_of_pcs: "", purchase_amount: "",
  });

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Fetch auth users for owner column
  const { data: authUsers = [] } = useQuery({
    queryKey: ["auth-users"],
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
      return (json.users ?? json) as { id: string; email: string }[];
    },
  });

  const userEmailMap: Record<string, string> = {};
  authUsers.forEach((u) => { userEmailMap[u.id] = u.email; });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        phone: form.phone || null,
        name: form.name || "Customer",
        note: form.note || null,
        date: form.date || null,
        type_of_custom: form.type_of_custom || null,
        leads_from: form.leads_from || null,
        stage: form.stage,
        number_of_pcs: form.number_of_pcs ? parseInt(form.number_of_pcs) : null,
        purchase_amount: form.purchase_amount ? parseFloat(form.purchase_amount) : null,
      };
      if (editing) {
        const { error } = await supabase.from("leads").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const session = (await supabase.auth.getSession()).data.session;
        const { error } = await supabase.from("leads").insert({ ...payload, created_by: session?.user?.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(editing ? "Lead updated" : "Lead added");
      resetForm();
    },
    onError: () => toast.error("Failed to save lead"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
    },
  });

  const resetForm = () => {
    setForm({ phone: "", name: "", note: "", date: "", type_of_custom: "", leads_from: "", stage: "cold", number_of_pcs: "", purchase_amount: "" });
    setEditing(null);
    setOpen(false);
  };

  const openEdit = (l: Lead) => {
    setEditing(l);
    setForm({
      phone: l.phone || "", name: l.name, note: l.note || "",
      date: l.date || "", type_of_custom: l.type_of_custom || "",
      leads_from: l.leads_from || "", stage: l.stage,
      number_of_pcs: l.number_of_pcs?.toString() || "",
      purchase_amount: l.purchase_amount?.toString() || "",
    });
    setOpen(true);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const allLeads: any[] = [];

      const sheetStageMap: Record<string, LeadStage> = {
        COLD: "cold",
        PROSPECT: "prospect",
        FIRST_BUY: "first_buy",
      };

      for (const sheetName of workbook.SheetNames) {
        const stage = sheetStageMap[sheetName.toUpperCase()];
        if (!stage) continue;

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

        for (const row of rows) {
          const phone = String(row["NUMBER PHONE"] || "").trim();
          const name = String(row["NAME"] || "Customer").trim();
          const note = String(row["NOTE"] || row["NOTE "] || "").trim();
          const rawDate = row["DATE"];
          const typeOfCustom = String(row["TYPE OF CUSTOM"] || "").trim();
          const leadsFrom = String(row["LEADS FROM"] || "").trim();
          const numPcs = row["NUMBER OF PCS"];
          const purchaseAmt = row["PURCHASE AMOUNT"];

          if (!phone && !name) continue;
          if (name === "Customer" && !phone) continue;

          let dateStr: string | null = null;
          if (rawDate) {
            if (typeof rawDate === "number") {
              const d = XLSX.SSF.parse_date_code(rawDate);
              dateStr = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
            } else {
              const parts = String(rawDate).split("/");
              if (parts.length === 3) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
              }
            }
          }

          allLeads.push({
            phone: phone || null,
            name: name || "Customer",
            note: note || null,
            date: dateStr,
            type_of_custom: typeOfCustom === "-" ? null : typeOfCustom || null,
            leads_from: leadsFrom || null,
            stage,
            number_of_pcs: numPcs ? parseInt(String(numPcs)) || null : null,
            purchase_amount: purchaseAmt ? parseFloat(String(purchaseAmt)) || null : null,
          });
        }
      }

      if (allLeads.length === 0) {
        toast.error("No valid leads found in the Excel file");
        return;
      }

      for (let i = 0; i < allLeads.length; i += 50) {
        const batch = allLeads.slice(i, i + 50);
        const { error } = await supabase.from("leads").insert(batch);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Imported ${allLeads.length} leads from Excel`);
    } catch (err: any) {
      toast.error("Failed to import: " + err.message);
    }

    e.target.value = "";
  };

  const handleExport = () => {
    const exportData = leads.map((l) => ({
      "NUMBER PHONE": l.phone || "",
      NAME: l.name,
      NOTE: l.note || "",
      DATE: l.date || "",
      "TYPE OF CUSTOM": l.type_of_custom || "",
      "LEADS FROM": l.leads_from || "",
      STAGE: stageLabel[l.stage],
      "NUMBER OF PCS": l.number_of_pcs || "",
      "PURCHASE AMOUNT": l.purchase_amount || "",
      OWNER: l.created_by ? (userEmailMap[l.created_by] || "Unknown") : "—",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Leads");
    XLSX.writeFile(wb, "ACD_Leads_Export.xlsx");
  };

  const uniqueOwnerIds = [...new Set(leads.map((l) => l.created_by).filter(Boolean))] as string[];

  const filtered = leads.filter((l) => {
    const matchesStage = activeStage === "all" || l.stage === activeStage;
    const matchesSearch = !search || [l.phone, l.name, l.note, l.type_of_custom, l.leads_from]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    const matchesOwner = ownerFilter === "all" || l.created_by === ownerFilter;
    return matchesStage && matchesSearch && matchesOwner;
  });

  const stageCounts = {
    all: leads.length,
    cold: leads.filter((l) => l.stage === "cold").length,
    prospect: leads.filter((l) => l.stage === "prospect").length,
    first_buy: leads.filter((l) => l.stage === "first_buy").length,
  };

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)));
    }
  };

  const selectedLeadsWithPhone = leads.filter(
    (l) => selectedIds.has(l.id) && l.phone
  );

  const handleBlast = () => {
    if (selectedLeadsWithPhone.length === 0) {
      toast.error("No selected leads have phone numbers");
      return;
    }

    let opened = 0;
    for (const lead of selectedLeadsWithPhone) {
      const phone = lead.phone!.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(
        blastMessage.replace(/\{\{name\}\}/gi, lead.name)
      );
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      opened++;
    }

    toast.success(`Opened ${opened} WhatsApp chat(s)`);
    setBlastOpen(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {uniqueOwnerIds.map((uid) => (
                <SelectItem key={uid} value={uid}>
                  {userEmailMap[uid]?.split("@")[0] || "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <Dialog open={blastOpen} onOpenChange={setBlastOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="h-4 w-4 mr-1" /> Blast WhatsApp ({selectedIds.size})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">WhatsApp Blast</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This will open {selectedLeadsWithPhone.length} WhatsApp chat tab(s) with a pre-filled message.
                    {selectedIds.size - selectedLeadsWithPhone.length > 0 && (
                      <span className="text-destructive"> ({selectedIds.size - selectedLeadsWithPhone.length} selected lead(s) have no phone number and will be skipped.)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{{name}}"}</code> to personalise with the lead's name.</p>
                  <Textarea
                    rows={4}
                    value={blastMessage}
                    onChange={(e) => setBlastMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <Button onClick={handleBlast} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-4 w-4 mr-1" /> Open {selectedLeadsWithPhone.length} Chat(s)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={leads.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <label>
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
            <Button variant="secondary" size="sm" asChild>
              <span><Upload className="h-4 w-4 mr-1" /> Import Excel</span>
            </Button>
          </label>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">{editing ? "Edit" : "New"} Lead</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
                <Input placeholder="Phone (start with 60)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Textarea placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <Input placeholder="Type of Custom (e.g. Running, Bola)" value={form.type_of_custom} onChange={(e) => setForm({ ...form, type_of_custom: e.target.value })} />
                <Select value={form.leads_from} onValueChange={(v) => setForm({ ...form, leads_from: v })}>
                  <SelectTrigger><SelectValue placeholder="Leads From" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADS">Ads</SelectItem>
                    <SelectItem value="ORGANIC">Organic</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as LeadStage })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="first_buy">First Buy</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Number of PCS" type="number" value={form.number_of_pcs} onChange={(e) => setForm({ ...form, number_of_pcs: e.target.value })} />
                {form.stage === "first_buy" && (
                  <Input placeholder="Purchase Amount (RM)" type="number" step="0.01" value={form.purchase_amount} onChange={(e) => setForm({ ...form, purchase_amount: e.target.value })} />
                )}
                <Button type="submit" variant="hero" className="w-full" disabled={saveMutation.isPending}>Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeStage} onValueChange={setActiveStage}>
        <TabsList>
          <TabsTrigger value="all">All ({stageCounts.all})</TabsTrigger>
          <TabsTrigger value="cold">Cold ({stageCounts.cold})</TabsTrigger>
          <TabsTrigger value="prospect">Prospect ({stageCounts.prospect})</TabsTrigger>
          <TabsTrigger value="first_buy">First Buy ({stageCounts.first_buy})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No leads found. Add one or import from Excel!</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[3%]">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[12%]">Phone</TableHead>
                <TableHead className="w-[10%]">Name</TableHead>
                <TableHead className="w-[14%]">Note</TableHead>
                <TableHead className="w-[8%]">Date</TableHead>
                <TableHead className="w-[8%]">Type</TableHead>
                <TableHead className="w-[7%]">Source</TableHead>
                <TableHead className="w-[8%]">Stage</TableHead>
                <TableHead className="w-[5%]">PCS</TableHead>
                {(activeStage === "first_buy" || activeStage === "all") && <TableHead className="w-[8%]">Amount</TableHead>}
                <TableHead className="w-[9%]">Owner</TableHead>
                <TableHead className="w-[8%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className={selectedIds.has(l.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(l.id)}
                      onCheckedChange={() => toggleSelect(l.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate">
                    <div className="flex items-center gap-1">
                      <span className="truncate">{l.phone || "—"}</span>
                      {l.phone && (
                        <a
                          href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400 transition-colors shrink-0"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm truncate">{l.name}</TableCell>
                  <TableCell className="text-xs truncate" title={l.note || ""}>{l.note || "—"}</TableCell>
                  <TableCell className="text-xs truncate">{l.date || "—"}</TableCell>
                  <TableCell className="text-xs truncate">{l.type_of_custom || "—"}</TableCell>
                  <TableCell className="text-xs truncate">{l.leads_from || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${stageBadge[l.stage]} text-xs`}>{stageLabel[l.stage]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{l.number_of_pcs || "—"}</TableCell>
                  {(activeStage === "first_buy" || activeStage === "all") && (
                    <TableCell className="text-xs truncate">{l.purchase_amount ? `RM ${Number(l.purchase_amount).toFixed(2)}` : "—"}</TableCell>
                  )}
                  <TableCell className="text-xs truncate text-muted-foreground">
                    {l.created_by ? (userEmailMap[l.created_by]?.split("@")[0] || "—") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(l.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
