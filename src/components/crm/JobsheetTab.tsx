import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, ImagePlus, Plus, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import acdLogo from "@/assets/black-3.png";
import { supabase } from "@/integrations/supabase/client";

const unisexSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"];
const femaleSizes = ["S", "M", "L", "XL", "2XL"];
const muslimahSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
const kidsSizes = ["20", "22", "24", "26", "28", "30", "32", "34"];
const flagSizes = ["FLAG"];

const categories = [
  "FLAG",
  "ADULTS: SHORT SLEEVE",
  "ADULTS: LONG SLEEVE",
  "ADULTS: SINGLET",
  "ADULTS: SLEEVELESS",
  "ADULTS: MUSLIMAH",
  "KIDS: SHORT SLEEVE",
  "KIDS: LONG SLEEVE",
  "KIDS: SINGLET",
  "LADIES: SHORT SLEEVE",
  "LADIES: LONG SLEEVE",
  "LADIES: SINGLET",
  "LADIES: MUSLIMAH",
  "CORPORATE MALE",
  "FEMALE MINI DRESS BACK CURVE",
  "OVERSIZED JERSEY",
  "LONG PANTS",
  "SHORT PANTS",
  "BASKETBALL TEE",
];

const getSizesForCategory = (category: string): string[] => {
  if (category === "FLAG") return flagSizes;
  if (category.includes("MUSLIMAH")) return muslimahSizes;
  if (category.startsWith("KIDS")) return kidsSizes;
  if (category.startsWith("LADIES") || category.startsWith("FEMALE")) return femaleSizes;
  return unisexSizes;
};

interface SizeRow {
  size: string;
  qty: number;
  nameset: string;
}

interface JobsheetEntry {
  category: string;
  type: string;
  material: string;
  remark: string;
  mockupImages: (string | null)[];
  sizeRows: SizeRow[];
}

const createEmptyEntry = (category = "ADULTS: SHORT SLEEVE"): JobsheetEntry => ({
  category,
  type: "",
  material: "",
  remark: "",
  mockupImages: [null, null],
  sizeRows: getSizesForCategory(category).map((s) => ({ size: s, qty: 0, nameset: "" })),
});

const JobsheetTab = () => {
  const [clientName, setClientName] = useState("");
  const [jobName, setJobName] = useState("");
  const [dateIn, setDateIn] = useState(new Date().toISOString().split("T")[0]);
  const [dateOut, setDateOut] = useState("");
  const [entries, setEntries] = useState<JobsheetEntry[]>([createEmptyEntry()]);

  const updateEntry = (idx: number, updates: Partial<JobsheetEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...updates } : e)));
  };

  const updateSizeRow = (entryIdx: number, rowIdx: number, field: keyof SizeRow, value: string | number) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== entryIdx) return e;
        const updated = [...e.sizeRows];
        (updated[rowIdx] as any)[field] = value;
        return { ...e, sizeRows: updated };
      })
    );
  };

  const addEntry = () => setEntries((prev) => [...prev, createEmptyEntry()]);

  const removeEntry = (idx: number) => {
    if (entries.length <= 1) {
      toast.error("You need at least one jobsheet");
      return;
    }
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMockupUpload = (entryIdx: number, imgIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEntries((prev) =>
        prev.map((entry, i) => {
          if (i !== entryIdx) return entry;
          const updated = [...entry.mockupImages];
          updated[imgIdx] = ev.target?.result as string;
          return { ...entry, mockupImages: updated };
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const removeMockup = (entryIdx: number, imgIdx: number) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== entryIdx) return entry;
        const updated = [...entry.mockupImages];
        updated[imgIdx] = null;
        return { ...entry, mockupImages: updated };
      })
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const grandTotal = entries.reduce((sum, e) => sum + e.sizeRows.reduce((s, r) => s + (r.qty || 0), 0), 0);

  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("jobsheets")
      .select("id, client_name, job_name, date_in, date_out, total_pcs, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return toast.error(error.message);
    setHistory(data || []);
  };

  useEffect(() => { if (historyOpen) loadHistory(); }, [historyOpen]);

  const saveJobsheet = async () => {
    if (!clientName || !jobName) {
      toast.error("Please fill in client name and job name");
      return;
    }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) {
      setSaving(false);
      return toast.error("You must be signed in to save");
    }
    const payload = {
      client_name: clientName,
      job_name: jobName,
      date_in: dateIn || null,
      date_out: dateOut || null,
      total_pcs: grandTotal,
      entries: entries as any,
      created_by: uid,
    };
    if (savedId) {
      const { error } = await supabase.from("jobsheets").update(payload).eq("id", savedId);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Jobsheet updated");
    } else {
      const { data, error } = await supabase.from("jobsheets").insert(payload).select("id").single();
      setSaving(false);
      if (error) return toast.error(error.message);
      setSavedId(data.id);
      toast.success("Jobsheet saved");
    }
  };

  const loadJobsheet = async (id: string, mode: "edit" | "duplicate" = "edit") => {
    const { data, error } = await supabase.from("jobsheets").select("*").eq("id", id).single();
    if (error) return toast.error(error.message);
    setClientName(mode === "duplicate" ? `${data.client_name} (copy)` : data.client_name);
    setJobName(data.job_name);
    setDateIn(mode === "duplicate" ? new Date().toISOString().split("T")[0] : (data.date_in || ""));
    setDateOut(mode === "duplicate" ? "" : (data.date_out || ""));
    setEntries((data.entries as any) || [createEmptyEntry()]);
    setSavedId(mode === "duplicate" ? null : data.id);
    setHistoryOpen(false);
    toast.success(mode === "duplicate" ? "Jobsheet duplicated — save to create a new copy" : "Jobsheet loaded");
  };

  const deleteJobsheet = async (id: string) => {
    if (!confirm("Delete this saved jobsheet?")) return;
    const { error } = await supabase.from("jobsheets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    if (savedId === id) setSavedId(null);
    loadHistory();
  };

  const newJobsheet = () => {
    setClientName(""); setJobName(""); setDateOut("");
    setDateIn(new Date().toISOString().split("T")[0]);
    setEntries([createEmptyEntry()]);
    setSavedId(null);
  };

  const renderJobsheetPage = async (doc: jsPDF, entry: JobsheetEntry, entryTotal: number) => {
    const pw = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 12;

    // Logo + header
    const logoW = 22;
    const logoH = 11;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = acdLogo;
      });
      doc.addImage(img, "PNG", margin, y - 1, logoW, logoH);
    } catch {}

    doc.setFillColor(0, 0, 0);
    doc.rect(margin + logoW + 4, y - 2, pw - margin * 2 - logoW - 4, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("SUBLIMATION JOBSHEET", margin + logoW + 10, y + 8);
    doc.setTextColor(0, 0, 0);

    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text("CLIENT NAME:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(clientName.toUpperCase(), margin + 32, y);

    const rightCol = pw / 2 + 15;
    doc.setFont("helvetica", "bold");
    doc.text("DATE IN :", rightCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(dateIn), rightCol + 22, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("JOB NAME :", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(jobName.toUpperCase(), margin + 32, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 30, 30);
    doc.text("DATE OUT :", rightCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(dateOut), rightCol + 24, y);
    doc.setTextColor(0, 0, 0);

    y += 10;
    const validMockups = (entry.mockupImages || []).filter((m) => m !== null) as string[];
    if (validMockups.length > 0) {
      const mockImgCount = validMockups.length;
      const maxTotalW = pw - margin * 2 - 20;
      const maxPerImg = mockImgCount === 1 ? maxTotalW : (maxTotalW - 10) / 2;
      const maxH = 70;
      let totalW = 0;
      const loaded: { img: HTMLImageElement; w: number; h: number }[] = [];
      for (const src of validMockups) {
        try {
          const mockImg = new Image();
          mockImg.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            mockImg.onload = () => resolve();
            mockImg.onerror = reject;
            mockImg.src = src;
          });
          const ratio = Math.min(maxPerImg / mockImg.naturalWidth, maxH / mockImg.naturalHeight);
          const imgW = mockImg.naturalWidth * ratio;
          const imgH = mockImg.naturalHeight * ratio;
          loaded.push({ img: mockImg, w: imgW, h: imgH });
          totalW += imgW;
        } catch {}
      }
      if (loaded.length > 0) {
        const gap = loaded.length > 1 ? 10 : 0;
        let imgX = (pw - (totalW + gap * (loaded.length - 1))) / 2;
        let maxRenderedH = 0;
        for (const { img, w, h } of loaded) {
          doc.addImage(img, "JPEG", imgX, y, w, h);
          imgX += w + gap;
          maxRenderedH = Math.max(maxRenderedH, h);
        }
        y += maxRenderedH + 8;
      }
    } else {
      const boxW = pw - margin * 2 - 40;
      const boxH = 50;
      const boxX = (pw - boxW) / 2;
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect(boxX, y, boxW, boxH, "S");
      doc.setLineDashPattern([], 0);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("MOCKUP IMAGE", pw / 2, y + boxH / 2, { align: "center" });
      doc.setTextColor(0, 0, 0);
      y += boxH + 8;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(entry.category, pw / 2, y, { align: "center" });
    y += 10;

    const detailX = margin;
    const tableStartX = margin + 85;
    const detailY = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Other Detail:", detailX, detailY);

    const maxDetailWidth = tableStartX - detailX - 5; // max width before hitting table

    let dy = detailY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TYPE :", detailX, dy);
    doc.setTextColor(30, 100, 200);
    const typeLines = doc.splitTextToSize(entry.type.toUpperCase() || "-", maxDetailWidth - 22);
    doc.text(typeLines, detailX + 22, dy);
    dy += typeLines.length * 5;
    doc.setTextColor(0, 0, 0);

    dy += 2;
    doc.setFont("helvetica", "bold");
    doc.text("MATERIAL:", detailX, dy);
    doc.setTextColor(30, 100, 200);
    const matLines = doc.splitTextToSize(entry.material.toUpperCase() || "-", maxDetailWidth - 24);
    doc.text(matLines, detailX + 24, dy);
    dy += matLines.length * 5;
    doc.setTextColor(0, 0, 0);

    if (entry.remark) {
      dy += 2;
      doc.setFont("helvetica", "bold");
      doc.text("REMARK:", detailX, dy);
      doc.setTextColor(30, 100, 200);
      const remarkText = entry.remark.toUpperCase().replace(/\n/g, "\n");
      const remarkLines = doc.splitTextToSize(remarkText, maxDetailWidth - 22);
      doc.text(remarkLines, detailX + 22, dy);
      dy += remarkLines.length * 5;
      doc.setTextColor(0, 0, 0);
    }

    const tableBody = entry.sizeRows.map((r) => [r.size, r.qty || "", r.nameset]);

    const namesetColWidth = pw - margin - tableStartX - 42;

    // Dynamically pick a font size so the longest nameset fits within the column.
    // autoTable will wrap text, but we shrink the font for very long entries to keep rows compact.
    const longestNameset = entry.sizeRows.reduce((max, r) => Math.max(max, (r.nameset || "").length), 0);
    let bodyFontSize = 9;
    if (longestNameset > 60) bodyFontSize = 7;
    else if (longestNameset > 40) bodyFontSize = 8;

    autoTable(doc, {
      startY: detailY - 3,
      head: [["SIZE", "QTY", "NAMESET"]],
      body: tableBody,
      theme: "grid",
      styles: {
        fontSize: bodyFontSize,
        cellPadding: 2.5,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      headStyles: {
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        fontSize: 9,
      },
      didParseCell: (data: any) => {
        if (data.section === "head") {
          if (data.column.index === 0) data.cell.styles.fillColor = [220, 30, 30];
          else if (data.column.index === 1) {
            data.cell.styles.fillColor = [240, 200, 0];
            data.cell.styles.textColor = [0, 0, 0];
          } else if (data.column.index === 2) data.cell.styles.fillColor = [0, 190, 220];
        }
        if (data.section === "body" && data.column.index === 2) {
          data.cell.styles.halign = "left";
        }
      },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.3 },
      margin: { left: tableStartX, right: margin },
      tableWidth: pw - margin - tableStartX,
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: namesetColWidth, overflow: "linebreak" },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(220, 30, 30);
    doc.text(`TOTAL =`, pw / 2 - 15, y);
    doc.text(`${entryTotal} PCS`, pw / 2 + 12, y);
    doc.setTextColor(0, 0, 0);
  };

  const generatePDF = async () => {
    if (!clientName || !jobName) {
      toast.error("Please fill in client name and job name");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < entries.length; i++) {
        if (i > 0) doc.addPage();
        const entry = entries[i];
        const entryTotal = entry.sizeRows.reduce((s, r) => s + (r.qty || 0), 0);
        await renderJobsheetPage(doc, entry, entryTotal);
      }

      const filename = `Jobsheet_${jobName || "draft"}.pdf`;
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);

      // Try anchor download first
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Fallback: open in a new tab so the user can save manually.
      // This is critical inside the Lovable preview iframe, which often
      // blocks programmatic downloads but allows window.open via user gesture.
      const popup = window.open(url, "_blank");
      if (!popup) {
        toast.error("Popup blocked — please allow popups for this site, or open the preview in a new tab.");
      } else {
        toast.success("Jobsheet PDF opened in a new tab — use the browser's save button to download.");
      }

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error(`PDF failed: ${err?.message || "unknown error"}`);
    }
  };

  if (historyOpen) {
    const filtered = history.filter((h) => {
      const q = historySearch.trim().toLowerCase();
      if (!q) return true;
      return (
        (h.client_name || "").toLowerCase().includes(q) ||
        (h.job_name || "").toLowerCase().includes(q)
      );
    });
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-display flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> Saved Jobsheets
            <span className="text-xs text-muted-foreground font-normal">({history.length})</span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(false)}>
            ← Back to editor
          </Button>
        </div>
        <Card>
          <CardHeader className="pb-3 gap-2">
            <CardTitle className="text-sm">History</CardTitle>
            <Input
              placeholder="Search by client or job name…"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Date In</TableHead>
                    <TableHead>Date Out</TableHead>
                    <TableHead className="text-center">PCS</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead className="w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-xs">{h.client_name}</TableCell>
                      <TableCell className="text-xs">{h.job_name}</TableCell>
                      <TableCell className="text-xs">{h.date_in || "—"}</TableCell>
                      <TableCell className="text-xs">{h.date_out || "—"}</TableCell>
                      <TableCell className="text-center text-xs">{h.total_pcs}</TableCell>
                      <TableCell className="text-xs">{new Date(h.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => loadJobsheet(h.id, "edit")}>
                            Open
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => loadJobsheet(h.id, "duplicate")}>
                            Duplicate
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteJobsheet(h.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                        {history.length === 0 ? "No saved jobsheets yet" : "No matches"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-display flex items-center gap-2">
          <FileText className="h-5 w-5" /> Sublimation Jobsheet
          {savedId && <span className="text-xs text-muted-foreground font-normal">(editing saved)</span>}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            {entries.length} sheet{entries.length > 1 ? "s" : ""} · {grandTotal} PCS total
          </span>
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            <FolderOpen className="h-4 w-4 mr-1" /> Saved
          </Button>
          {savedId && (
            <Button variant="outline" size="sm" onClick={newJobsheet}>New</Button>
          )}
          <Button variant="outline" size="sm" onClick={saveJobsheet} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {savedId ? "Update" : "Save"}
          </Button>
          <Button variant="hero" onClick={generatePDF}>
            <Download className="h-4 w-4 mr-1" /> Generate PDF
          </Button>
        </div>
      </div>

      {/* Shared job details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Job Details (shared across all sheets)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Client Name</label>
              <Input placeholder="e.g. ALYPH ACD" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Job Name</label>
              <Input placeholder="e.g. ORCA" value={jobName} onChange={(e) => setJobName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div>
              <label className="text-xs text-muted-foreground">Date In</label>
              <Input type="date" value={dateIn} onChange={(e) => setDateIn(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Date Out</label>
              <Input type="date" value={dateOut} onChange={(e) => setDateOut(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual jobsheet entries */}
      {entries.map((entry, idx) => {
        const entryTotal = entry.sizeRows.reduce((s, r) => s + (r.qty || 0), 0);
        return (
          <Card key={idx} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Sheet {idx + 1}: {entry.category}
                </CardTitle>
                {entries.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeEntry(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Category</label>
                  <Select value={entry.category} onValueChange={(v) => updateEntry(idx, { category: v, sizeRows: getSizesForCategory(v).map((s) => ({ size: s, qty: 0, nameset: "" })) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <Input placeholder="e.g. V-NECK CROSS" value={entry.type} onChange={(e) => updateEntry(idx, { type: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Material</label>
                  <Input placeholder="e.g. DIAMOND 160GSM" value={entry.material} onChange={(e) => updateEntry(idx, { material: e.target.value })} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-muted-foreground">Remark (optional, press Enter for new line)</label>
                  <Textarea placeholder="e.g. Extra notes" value={entry.remark || ""} onChange={(e) => updateEntry(idx, { remark: e.target.value })} className="min-h-[60px]" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Mockup Images (max 2)</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {(entry.mockupImages || [null, null]).map((img, imgIdx) => (
                    <div key={imgIdx} className="flex items-center gap-2">
                      <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
                        <ImagePlus className="h-4 w-4" />
                        {img ? `Change #${imgIdx + 1}` : `Upload #${imgIdx + 1}`}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMockupUpload(idx, imgIdx, e)} />
                      </label>
                      {img && (
                        <div className="relative">
                          <img src={img} alt={`Mockup ${imgIdx + 1}`} className="h-12 w-12 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeMockup(idx, imgIdx)}
                            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Size table */}
              <div>
                <div className="grid grid-cols-[60px_80px_1fr] gap-2 mb-2 text-xs font-semibold text-muted-foreground px-1">
                  <span>SIZE</span>
                  <span>QTY</span>
                  <span>NAMESET</span>
                </div>
                <div className="space-y-1">
                  {entry.sizeRows.map((row, i) => (
                    <div key={row.size} className="grid grid-cols-[60px_80px_1fr] gap-2 items-center">
                      <span className="text-sm font-medium pl-1">{row.size}</span>
                      <Input
                        type="number"
                        min={0}
                        value={row.qty || ""}
                        onChange={(e) => updateSizeRow(idx, i, "qty", parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="e.g. ALYPH(77)"
                        value={row.nameset}
                        onChange={(e) => updateSizeRow(idx, i, "nameset", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-3 border-t mt-3 text-sm font-semibold">
                  <span>Subtotal: {entryTotal} PCS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" className="w-full" onClick={addEntry}>
        <Plus className="h-4 w-4 mr-1" /> Add Another Sheet
      </Button>
    </div>
  );
};

export default JobsheetTab;
