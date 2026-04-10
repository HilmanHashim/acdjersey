import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileText, Download, RefreshCw, Pencil } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import acdLogo from "@/assets/black-3.png";

interface LineItem {
  description: string;
  price: number;
  quantity: number;
}

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

const InvoiceTab = () => {
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isInvoiceNumberLocked, setIsInvoiceNumberLocked] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [agent, setAgent] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [jerseyItems, setJerseyItems] = useState<LineItem[]>([{ description: "", price: 0, quantity: 0 }]);
  const [designItems, setDesignItems] = useState<LineItem[]>([{ description: "", price: 0, quantity: 0 }]);
  const [validity, setValidity] = useState("60");
  const [paymentTerm, setPaymentTerm] = useState("14");
  const [deliveryTerm, setDeliveryTerm] = useState("20");
  const [notes, setNotes] = useState(
    "Prices are subjected to change without prior notice. We hope that our quotation is favourable to you and looking forward to receive your valued orders in due course. Thank and regards.",
  );
  const [shirtDepositEnabled, setShirtDepositEnabled] = useState(true);
  const [shirtDepositPercent, setShirtDepositPercent] = useState(50);
  const [designDepositEnabled, setDesignDepositEnabled] = useState(false);
  const [designDepositPercent, setDesignDepositPercent] = useState(100);
  const [depositNote, setDepositNote] = useState("50 % Deposit is required before procceed an order");
  const [managerName, setManagerName] = useState("AHMAD UMAR NAZMI");
  const [managerTitle, setManagerTitle] = useState("MANAGER");
  const [bankName, setBankName] = useState("Maybank (Bimasakti Marketing)");
  const [accountNumber, setAccountNumber] = useState("512745567892");
  const [phone, setPhone] = useState("+60 19 - 339 6681");
  const [emailAddr, setEmailAddr] = useState("umarnazmi10@gmail.com");

  const addJerseyItem = () => setJerseyItems([...jerseyItems, { description: "", price: 0, quantity: 0 }]);
  const removeJerseyItem = (i: number) => setJerseyItems(jerseyItems.filter((_, idx) => idx !== i));
  const updateJerseyItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...jerseyItems];
    (updated[i] as any)[field] = value;
    setJerseyItems(updated);
  };

  const addDesignItem = () => setDesignItems([...designItems, { description: "", price: 0, quantity: 0 }]);
  const removeDesignItem = (i: number) => setDesignItems(designItems.filter((_, idx) => idx !== i));
  const updateDesignItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...designItems];
    (updated[i] as any)[field] = value;
    setDesignItems(updated);
  };

  const hasJerseyItems = jerseyItems.some((it) => it.description.trim() !== "" || it.price > 0 || it.quantity > 0);
  const hasDesignItems = designItems.some((it) => it.description.trim() !== "" || it.price > 0 || it.quantity > 0);

  const jerseyPcs = jerseyItems.reduce((s, it) => s + (it.quantity || 0), 0);
  const jerseyAmount = jerseyItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
  const designPcs = designItems.reduce((s, it) => s + (it.quantity || 0), 0);
  const designAmount = designItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

  const totalPcs = jerseyPcs + designPcs;
  const totalAmount = jerseyAmount + designAmount;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/ ${d.getFullYear()}`;
  };

  const generateInvoiceNumber = async () => {
    setIsGeneratingNumber(true);
    try {
      const { data, error } = await supabase.rpc("get_next_invoice_number");
      if (error) throw error;
      setInvoiceNumber(data);
      setIsInvoiceNumberLocked(true);
      toast.success(`Invoice number generated: ${data}`);
    } catch (err: any) {
      toast.error("Failed to generate invoice number: " + err.message);
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  const generatePDF = async () => {
    if (!title || (!hasJerseyItems && !hasDesignItems)) {
      toast.error("Please fill in title and at least one item");
      return;
    }

    // Auto-generate invoice number if not set
    let currentInvoiceNumber = invoiceNumber;
    if (!currentInvoiceNumber) {
      try {
        const { data, error } = await supabase.rpc("get_next_invoice_number");
        if (error) throw error;
        currentInvoiceNumber = data;
        setInvoiceNumber(data);
        setIsInvoiceNumberLocked(true);
      } catch (err: any) {
        toast.error("Failed to generate invoice number: " + err.message);
        return;
      }
    } else if (!isInvoiceNumberLocked) {
      // If manually entered, still increment the sequence
      try {
        await supabase.rpc("get_next_invoice_number");
      } catch {
        // Non-blocking
      }
      setIsInvoiceNumberLocked(true);
    }

    // Log the invoice
    try {
      await supabase.from("invoices_log").insert({
        invoice_number: currentInvoiceNumber,
        title,
        total_amount: totalAmount,
      });
    } catch {
      // Non-blocking
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
      doc.addImage(img, "PNG", pw - margin - 28, y - 2, 28, 14);
    } catch {
      // Logo failed, continue without
    }

    // Header
    doc.setFont("kollektif", "bold");
    doc.setFontSize(28);
    doc.text("INVOICE", margin, y + 8);

    y += 20;
    doc.setFontSize(10);
    doc.setFont("kollektif", "normal");
    doc.text("Date:", margin, y);
    y += 5;
    doc.text(formatDate(invoiceDate), margin, y);
    y += 3;
    doc.setDrawColor(0);
    doc.line(margin, y, margin + 60, y);

    y += 6;
    doc.text("No. Invoice :", margin, y);
    y += 5;
    doc.text(currentInvoiceNumber, margin, y);
    y += 3;
    doc.line(margin, y, margin + 60, y);

    y += 8;
    doc.setFont("kollektif", "bold");
    doc.setFontSize(11);
    doc.text(`TITLE :  ${title.toUpperCase()}`, margin, y);

    // Customer details on the right side
    const tableRightEdge = pw - margin;
    const custX = tableRightEdge - 55;
    let custY = y;
    if (customerName || customerPhone || customerAddress) {
      doc.setFont("kollektif", "bold");
      doc.setFontSize(10);
      doc.text("CUSTOMER DETAILS:", custX, custY);
      custY += 6;
      doc.setFont("kollektif", "normal");
      if (customerName) {
        doc.text(customerName.toUpperCase(), custX, custY);
        custY += 5;
      }
      if (customerPhone) {
        doc.text(customerPhone, custX, custY);
        custY += 5;
      }
      if (customerAddress) {
        const splitAddr = doc.splitTextToSize(customerAddress.toUpperCase(), pw / 2 - 25);
        doc.text(splitAddr, custX, custY);
        custY += splitAddr.length * 5;
      }
    }

    y += 6;
    doc.setFont("kollektif", "bold");
    doc.setFontSize(11);
    if (material) {
      doc.text(`MATERIAL: ${material.toUpperCase()}`, margin, y);
      y += 6;
    }
    if (agent) {
      doc.text(`SA : ${agent.toUpperCase()}`, margin, y);
      y += 6;
    }
    // Ensure y is at least past customer details block
    y = Math.max(y, custY);

    // Helper to render a table section
    const renderTable = (label: string, tableItems: LineItem[]) => {
      y += 4;
      doc.setFont("kollektif", "bold");
      doc.setFontSize(10);
      doc.text(label.toUpperCase(), margin, y);
      y += 6;

      const tableData = tableItems.map((it) => [
        it.description.toUpperCase(),
        `RM ${it.price.toFixed(0)}`,
        `${it.quantity}PCS`,
        `RM ${(it.price * it.quantity).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Item Description", "Price", "Quantity", "TOTAL"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 4, halign: "center", valign: "middle" },
        headStyles: {
          fillColor: [60, 60, 60],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          lineColor: [60, 60, 60],
          lineWidth: 0.3,
        },
        bodyStyles: { lineColor: [180, 180, 180], lineWidth: 0.3 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: margin + 33, right: margin },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 6;
    };

    // Render jersey table
    if (hasJerseyItems) {
      renderTable("Jersey", jerseyItems.filter((it) => it.description.trim() || it.price > 0 || it.quantity > 0));
    }

    // Render design table
    if (hasDesignItems) {
      renderTable("Design", designItems.filter((it) => it.description.trim() || it.price > 0 || it.quantity > 0));
    }

    y += 4;

    // Total summary
    doc.setFont("kollektif", "bold");
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

    // Deposit amounts
    let totalDeposit = 0;

    if (shirtDepositEnabled && hasJerseyItems) {
      const shirtDeposit = jerseyAmount * (shirtDepositPercent / 100);
      totalDeposit += shirtDeposit;
      y += 16;
      doc.setFont("kollektif", "bold");
      doc.setFontSize(10);
      doc.text(`DEPOSIT (JERSEY ${shirtDepositPercent}%)`, summaryX - 10, y + 3);
      doc.setFillColor(230, 230, 230);
      doc.rect(summaryX + 40, y - 5, 45, 12, "F");
      doc.setTextColor(0);
      doc.text(`RM${shirtDeposit.toLocaleString()}`, summaryX + 44, y + 3);
    }

    if (designDepositEnabled && hasDesignItems) {
      const designDeposit = designAmount * (designDepositPercent / 100);
      totalDeposit += designDeposit;
      y += 16;
      doc.setFont("kollektif", "bold");
      doc.setFontSize(10);
      doc.text(`DEPOSIT (DESIGN ${designDepositPercent}%)`, summaryX - 10, y + 3);
      doc.setFillColor(230, 230, 230);
      doc.rect(summaryX + 40, y - 5, 45, 12, "F");
      doc.setTextColor(0);
      doc.text(`RM${designDeposit.toLocaleString()}`, summaryX + 44, y + 3);
    }

    if (totalDeposit > 0) {
      y += 16;
      doc.setFont("kollektif", "bold");
      doc.setFontSize(10);
      doc.text("TOTAL DEPOSIT", summaryX - 10, y + 3);
      doc.setFillColor(210, 210, 210);
      doc.rect(summaryX + 40, y - 5, 45, 12, "F");
      doc.setTextColor(0);
      doc.text(`RM${totalDeposit.toLocaleString()}`, summaryX + 44, y + 3);
    }

    // Terms
    y += 40;
    doc.setFont("kollektif", "bold");
    doc.setFontSize(10);
    doc.text(`VALIDITY : ${validity} days`, margin, y);
    y += 6;
    doc.text(`PAYMENT TERM: ${paymentTerm} days`, margin, y);
    y += 6;
    doc.text(`DELIVERY TERM : ${deliveryTerm} days`, margin, y);

    // Notes
    y += 8;
    doc.setFont("kollektif", "normal");
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(`Note : ${notes}`, pw / 2 - 10);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4 + 4;

    doc.setFontSize(9);
    doc.text(depositNote, margin + 2, y);

    // Manager + payment section (right side)
    const rightX = pw - margin - 65;
    let ry = y - 20;
    doc.setFont("kollektif", "bold");
    doc.setFontSize(11);
    doc.text(managerName, rightX, ry);
    ry += 6;
    doc.text(managerTitle, rightX, ry);

    ry += 10;
    doc.setFontSize(9);
    doc.setFont("kollektif", "normal");
    doc.text("Payment Method:", rightX, ry);
    ry += 6;
    doc.text("Bank Name: ", rightX, ry);
    doc.setFont("kollektif", "bold");
    doc.text(bankName, rightX + 22, ry);
    ry += 6;
    doc.setFont("kollektif", "normal");
    doc.text("Account Number: ", rightX, ry);
    doc.setFont("kollektif", "bold");
    doc.text(accountNumber, rightX + 30, ry);

    // Thank you + contact
    y += 10;
    doc.setFont("kollektif", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("THANK YOU!", margin, y + 8);
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.setFont("kollektif", "normal");

    // Phone icon - small phone rectangle
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin + 5.5, y + 12.5, 2.5, 4, 0.5, 0.5, "S");
    doc.setFontSize(8);
    doc.text(phone, margin + 10, y + 16);

    // Email icon - small envelope
    doc.rect(margin + 5.5, y + 18, 3, 2, "S");
    doc.line(margin + 5.5, y + 18, margin + 7, y + 19);
    doc.line(margin + 8.5, y + 18, margin + 7, y + 19);
    doc.text(emailAddr, margin + 10, y + 20.5);

    doc.save(`Invoice_${currentInvoiceNumber}.pdf`);
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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Invoice No.</label>
                <div className="flex gap-1">
                  <Input
                    placeholder="Click Generate"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    disabled={isInvoiceNumberLocked}
                    className="flex-1"
                  />
                  {!isInvoiceNumberLocked ? (
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={generateInvoiceNumber} disabled={isGeneratingNumber} title="Generate invoice number">
                      <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingNumber ? "animate-spin" : ""}`} />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setIsInvoiceNumberLocked(false)} title="Amend invoice number">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
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
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Customer Name</label>
              <Input placeholder="e.g. John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Contact Number</label>
              <Input placeholder="e.g. +60 12-345 6789" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Address</label>
              <Textarea placeholder="Customer address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="text-xs" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Terms & Conditions</CardTitle>
          </CardHeader>
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

      {/* Jersey Line Items */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Jersey Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addJerseyItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {jerseyItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_100px_36px] gap-2 items-center">
              <Input placeholder="VNECK CROSS SHORTSLEEVE + NAMESET" value={item.description} onChange={(e) => updateJerseyItem(i, "description", e.target.value)} />
              <Input type="number" placeholder="Price (RM)" value={item.price || ""} onChange={(e) => updateJerseyItem(i, "price", parseFloat(e.target.value) || 0)} />
              <Input type="number" placeholder="Qty" value={item.quantity || ""} onChange={(e) => updateJerseyItem(i, "quantity", parseInt(e.target.value) || 0)} />
              <div className="text-sm font-medium text-right">RM {(item.price * item.quantity).toLocaleString()}</div>
              {jerseyItems.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeJerseyItem(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={shirtDepositEnabled} onChange={(e) => setShirtDepositEnabled(e.target.checked)} className="rounded" />
              <span className="text-xs">Deposit</span>
              <Input type="number" value={shirtDepositPercent} onChange={(e) => setShirtDepositPercent(parseFloat(e.target.value) || 0)} className="w-16 h-7 text-xs" disabled={!shirtDepositEnabled} />
              <span className="text-xs text-muted-foreground">%</span>
              {shirtDepositEnabled && <span className="text-xs font-medium ml-2">= RM {(jerseyAmount * shirtDepositPercent / 100).toLocaleString()}</span>}
            </div>
            <div className="flex gap-6 text-sm font-semibold">
              <span>Total: {jerseyPcs} PCS</span>
              <span>RM {jerseyAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Line Items */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Design Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addDesignItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {designItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_100px_36px] gap-2 items-center">
              <Input placeholder="LOGO DESIGN / MOCKUP" value={item.description} onChange={(e) => updateDesignItem(i, "description", e.target.value)} />
              <Input type="number" placeholder="Price (RM)" value={item.price || ""} onChange={(e) => updateDesignItem(i, "price", parseFloat(e.target.value) || 0)} />
              <Input type="number" placeholder="Qty" value={item.quantity || ""} onChange={(e) => updateDesignItem(i, "quantity", parseInt(e.target.value) || 0)} />
              <div className="text-sm font-medium text-right">RM {(item.price * item.quantity).toLocaleString()}</div>
              {designItems.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDesignItem(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={designDepositEnabled} onChange={(e) => setDesignDepositEnabled(e.target.checked)} className="rounded" />
              <span className="text-xs">Deposit</span>
              <Input type="number" value={designDepositPercent} onChange={(e) => setDesignDepositPercent(parseFloat(e.target.value) || 0)} className="w-16 h-7 text-xs" disabled={!designDepositEnabled} />
              <span className="text-xs text-muted-foreground">%</span>
              {designDepositEnabled && <span className="text-xs font-medium ml-2">= RM {(designAmount * designDepositPercent / 100).toLocaleString()}</span>}
            </div>
            <div className="flex gap-6 text-sm font-semibold">
              <span>Total: {designPcs} PCS</span>
              <span>RM {designAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grand Total */}
      {(hasJerseyItems || hasDesignItems) && (
        <div className="flex justify-end gap-6 text-sm font-bold px-2">
          <span>Grand Total: {totalPcs} PCS</span>
          <span>RM {totalAmount.toLocaleString()}</span>
        </div>
      )}

      {/* Payment & Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Payment & Contact Info</CardTitle>
        </CardHeader>
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
