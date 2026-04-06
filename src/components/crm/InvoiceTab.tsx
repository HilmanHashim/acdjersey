import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import acdLogo from "@/assets/logo-black.png";

interface LineItem {
  description: string;
  price: number;
  quantity: number;
}

const agents = [
  "ALIFF ACD", "DIDO ACD", "HARITH ACD", "UMAR ACD",
  "FAIZ ACD", "HILMAN ACD", "IMAN ACD", "JEED ACD", "ADAM ACD"
];

const InvoiceTab = () => {
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [agent, setAgent] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", price: 0, quantity: 0 }]);
  const [validity, setValidity] = useState("60");
  const [paymentTerm, setPaymentTerm] = useState("14");
  const [deliveryTerm, setDeliveryTerm] = useState("20");
  const [notes, setNotes] = useState(
    "Prices are subjected to change without prior notice. We hope that our quotation is favourable to you and looking forward to receive your valued orders in due course. Thank and regards."
  );
  const [depositNote, setDepositNote] = useState("50 % Deposit is required before procceed an order");
  const [managerName, setManagerName] = useState("AHMAD UMAR NAZMI");
  const [managerTitle, setManagerTitle] = useState("MANAGER");
  const [bankName, setBankName] = useState("Maybank (Bimasakti Marketing)");
  const [accountNumber, setAccountNumber] = useState("512745567892");
  const [phone, setPhone] = useState("+60 19 - 339 6681");
  const [emailAddr, setEmailAddr] = useState("umarnazmi10@gmail.com");

  const addItem = () => setItems([...items, { description: "", price: 0, quantity: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    setItems(updated);
  };

  const totalPcs = items.reduce((s, it) => s + (it.quantity || 0), 0);
  const totalAmount = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/ ${d.getFullYear()}`;
  };

  const generatePDF = async () => {
    if (!invoiceNumber || !title || items.length === 0) {
      toast.error("Please fill in invoice number, title, and at least one item");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Load logo
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = acdLogo;
      });
      doc.addImage(img, "PNG", pw - margin - 30, y - 2, 30, 10);
    } catch {
      // Logo failed, continue without
    }

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("INVOICE", margin, y + 8);

    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Date:", margin, y);
    y += 5;
    doc.text(formatDate(invoiceDate), margin, y);
    y += 3;
    doc.setDrawColor(0);
    doc.line(margin, y, margin + 60, y);

    y += 6;
    doc.text("No. Invoice :", margin, y);
    y += 5;
    doc.text(invoiceNumber, margin, y);
    y += 3;
    doc.line(margin, y, margin + 60, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`TITLE :  ${title.toUpperCase()}`, margin, y);
    y += 6;
    if (material) {
      doc.text(`MATERIAL: ${material.toUpperCase()}`, margin, y);
      y += 6;
    }
    if (agent) {
      doc.text(`SA : ${agent.toUpperCase()}`, margin, y);
      y += 6;
    }

    // Items table
    y += 4;
    const tableData = items.map((it) => [
      it.description.toUpperCase(),
      `RM ${it.price.toFixed(0)}`,
      `${it.quantity}PCS`,
      `RM ${(it.price * it.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Item Description", "Price", "Quantity", "TOTAL"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4, halign: "center", valign: "middle" },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: "bold", lineColor: [150, 150, 150], lineWidth: 0.3 },
      bodyStyles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: pw / 2 - 75, right: margin },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Total summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const summaryX = pw / 2;
    doc.text("TOTAL SHIRT", summaryX - 10, y);
    doc.text("ORDER", summaryX - 3, y + 5);

    // Yellow box for PCS
    doc.setFillColor(255, 213, 0);
    doc.rect(summaryX + 20, y - 5, 30, 12, "F");
    doc.setTextColor(0);
    doc.text(`${totalPcs} PCS`, summaryX + 25, y + 3);

    // Cyan box for amount
    doc.setFillColor(0, 220, 220);
    doc.rect(summaryX + 53, y - 5, 35, 12, "F");
    doc.text(`RM${totalAmount.toLocaleString()}`, summaryX + 57, y + 3);

    doc.setTextColor(0);

    // Terms
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`VALIDITY : ${validity} days`, margin, y);
    y += 6;
    doc.text(`PAYMENT TERM: ${paymentTerm} days`, margin + 2, y);
    y += 6;
    doc.text(`DELIVERY TERM : ${deliveryTerm} days`, margin + 2, y);

    // Notes
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(`Note : ${notes}`, pw / 2 - 10);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4 + 4;

    doc.setFontSize(9);
    doc.text(depositNote, margin + 2, y);

    // Manager + payment section (right side)
    const rightX = pw / 2 + 10;
    let ry = y - 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(managerName, rightX, ry);
    ry += 6;
    doc.text(managerTitle, rightX, ry);

    ry += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Method:", rightX, ry);
    ry += 6;
    doc.text("Bank Name: ", rightX, ry);
    doc.setFont("helvetica", "bold");
    doc.text(bankName, rightX + 22, ry);
    ry += 6;
    doc.setFont("helvetica", "normal");
    doc.text("Account Number: ", rightX, ry);
    doc.setFont("helvetica", "bold");
    doc.text(accountNumber, rightX + 30, ry);

    // Thank you + contact
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("THANK YOU!", margin, y + 8);
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(phone, margin + 5, y + 16);
    doc.text(emailAddr, margin + 5, y + 21);

    doc.save(`Invoice_${invoiceNumber}.pdf`);
    toast.success("Invoice PDF generated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display flex items-center gap-2">
          <FileText className="h-5 w-5" /> Invoice Generator
        </h2>
        <Button variant="hero" onClick={generatePDF}>
          <Download className="h-4 w-4 mr-1" /> Generate PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Details */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Invoice No.</label>
                <Input placeholder="e.g. 00448" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input placeholder="e.g. ORCA" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Material</label>
              <Input placeholder="e.g. DIAMOND 160GSM" value={material} onChange={(e) => setMaterial(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sales Agent (SA)</label>
              <Select value={agent} onValueChange={setAgent}>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Terms & Conditions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Validity (days)</label>
                <Input value={validity} onChange={(e) => setValidity(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Payment Term (days)</label>
                <Input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Delivery Term (days)</label>
                <Input value={deliveryTerm} onChange={(e) => setDeliveryTerm(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs" rows={3} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Deposit Note</label>
              <Input value={depositNote} onChange={(e) => setDepositNote(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Line Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_100px_36px] gap-2 items-center">
              <Input
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price (RM)"
                value={item.price || ""}
                onChange={(e) => updateItem(i, "price", parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity || ""}
                onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 0)}
              />
              <div className="text-sm font-medium text-right">
                RM {(item.price * item.quantity).toLocaleString()}
              </div>
              {items.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-6 pt-3 border-t text-sm font-semibold">
            <span>Total: {totalPcs} PCS</span>
            <span>RM {totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Contact */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Payment & Contact Info</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Manager Name</label>
              <Input value={managerName} onChange={(e) => setManagerName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input value={managerTitle} onChange={(e) => setManagerTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Bank Name</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Account Number</label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <Input value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceTab;
