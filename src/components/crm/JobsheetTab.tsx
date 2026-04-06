import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import acdLogo from "@/assets/black-3.png";

const agents = [
  "ALIFF ACD",
  "DIDO ACD",
  "HARITH ACD",
  "UMAR ACD",
  "FAIZ ACD",
  "HILMAN ACD",
  "IMAN ACD",
  "JEED ACD",
  "ADAM ACD",
];

const sizes = ["24", "34", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];

const categories = [
  "ADULTS: SHORTSLEEVE",
  "ADULTS: LONGSLEEVE",
  "KIDS: SHORTSLEEVE",
  "KIDS: LONGSLEEVE",
  "LADIES: SHORTSLEEVE",
  "LADIES: LONGSLEEVE",
];

interface SizeRow {
  size: string;
  qty: number;
  nameset: string;
}

const JobsheetTab = () => {
  const [clientName, setClientName] = useState("");
  const [jobName, setJobName] = useState("");
  const [dateIn, setDateIn] = useState(new Date().toISOString().split("T")[0]);
  const [dateOut, setDateOut] = useState("");
  const [category, setCategory] = useState("ADULTS: SHORTSLEEVE");
  const [type, setType] = useState("");
  const [material, setMaterial] = useState("");
  const [agent, setAgent] = useState("");
  const [mockupImage, setMockupImage] = useState<string | null>(null);
  const [sizeRows, setSizeRows] = useState<SizeRow[]>(sizes.map((s) => ({ size: s, qty: 0, nameset: "" })));

  const totalPcs = sizeRows.reduce((s, r) => s + (r.qty || 0), 0);

  const updateSizeRow = (i: number, field: keyof SizeRow, value: string | number) => {
    const updated = [...sizeRows];
    (updated[i] as any)[field] = value;
    setSizeRows(updated);
  };

  const handleMockupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMockupImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const generatePDF = async () => {
    if (!clientName || !jobName) {
      toast.error("Please fill in client name and job name");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 12;

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
    if (mockupImage) {
      try {
        const mockImg = new Image();
        mockImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          mockImg.onload = () => resolve();
          mockImg.onerror = reject;
          mockImg.src = mockupImage;
        });
        const maxW = pw - margin * 2 - 20;
        const maxH = 70;
        const ratio = Math.min(maxW / mockImg.naturalWidth, maxH / mockImg.naturalHeight);
        const imgW = mockImg.naturalWidth * ratio;
        const imgH = mockImg.naturalHeight * ratio;
        const imgX = (pw - imgW) / 2;
        doc.addImage(mockImg, "JPEG", imgX, y, imgW, imgH);
        y += imgH + 8;
      } catch {
        y += 5;
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
    doc.text(category, pw / 2, y, { align: "center" });
    y += 10;

    const detailX = margin;
    const tableStartX = margin + 85;
    const detailY = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Other Detail:", detailX, detailY);

    let dy = detailY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TYPE :", detailX, dy);
    doc.setTextColor(30, 100, 200);
    doc.text(type.toUpperCase() || "-", detailX + 22, dy);
    doc.setTextColor(0, 0, 0);

    dy += 6;
    doc.setFont("helvetica", "bold");
    doc.text("MATERIAL:", detailX, dy);
    doc.setTextColor(30, 100, 200);
    doc.text(material.toUpperCase() || "-", detailX + 24, dy);
    doc.setTextColor(0, 0, 0);

    if (agent) {
      dy += 6;
      doc.setFont("helvetica", "bold");
      doc.text("SA :", detailX, dy);
      doc.setTextColor(30, 100, 200);
      doc.text(agent.toUpperCase(), detailX + 12, dy);
      doc.setTextColor(0, 0, 0);
    }

    const tableBody = sizeRows.map((r) => [r.size, r.qty || "", r.nameset]);

    autoTable(doc, {
      startY: detailY - 3,
      head: [["SIZE", "QTY", "NAMESET"]],
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5, halign: "center", valign: "middle" },
      headStyles: {
        fillColor: [0, 190, 220],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.3 },
      margin: { left: tableStartX, right: margin },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: pw - margin - tableStartX - 42 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(220, 30, 30);
    doc.text(`TOTAL =`, pw / 2 - 15, y);
    doc.text(`${totalPcs} PCS`, pw / 2 + 12, y);
    doc.setTextColor(0, 0, 0);

    doc.save(`Jobsheet_${jobName || "draft"}.pdf`);
    toast.success("Jobsheet PDF generated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display flex items-center gap-2">
          <FileText className="h-5 w-5" /> Sublimation Jobsheet
        </h2>
        <Button variant="hero" onClick={generatePDF}>
          <Download className="h-4 w-4 mr-1" /> Generate PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Client Name</label>
              <Input placeholder="e.g. ALYPH ACD" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Job Name</label>
              <Input placeholder="e.g. ORCA" value={jobName} onChange={(e) => setJobName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Date In</label>
                <Input type="date" value={dateIn} onChange={(e) => setDateIn(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Date Out</label>
                <Input type="date" value={dateOut} onChange={(e) => setDateOut(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Other Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Input placeholder="e.g. V-NECK CROSS" value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Material</label>
              <Input placeholder="e.g. DIAMOND 160GSM" value={material} onChange={(e) => setMaterial(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sales Agent (SA)</label>
              <Select value={agent} onValueChange={setAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mockup Image</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
                  <ImagePlus className="h-4 w-4" />
                  {mockupImage ? "Change Image" : "Upload Mockup"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleMockupUpload} />
                </label>
                {mockupImage && (
                  <img src={mockupImage} alt="Mockup preview" className="h-12 w-12 object-cover rounded border" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Size & Nameset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[60px_80px_1fr] gap-2 mb-2 text-xs font-semibold text-muted-foreground px-1">
            <span>SIZE</span>
            <span>QTY</span>
            <span>NAMESET</span>
          </div>
          <div className="space-y-1">
            {sizeRows.map((row, i) => (
              <div key={row.size} className="grid grid-cols-[60px_80px_1fr] gap-2 items-center">
                <span className="text-sm font-medium pl-1">{row.size}</span>
                <Input
                  type="number"
                  min={0}
                  value={row.qty || ""}
                  onChange={(e) => updateSizeRow(i, "qty", parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="e.g. ALYPH(77)"
                  value={row.nameset}
                  onChange={(e) => updateSizeRow(i, "nameset", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-3 border-t mt-3 text-sm font-semibold">
            <span>Total: {totalPcs} PCS</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsheetTab;
