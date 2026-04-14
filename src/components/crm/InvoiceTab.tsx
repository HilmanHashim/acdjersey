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
  "MUNIR ACD",
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
  const [shirtDepositMode, setShirtDepositMode] = useState<"percent" | "custom">("percent");
  const [shirtDepositPercent, setShirtDepositPercent] = useState(50);
  const [shirtDepositCustom, setShirtDepositCustom] = useState(0);
  const [lockDepositAmount, setLockDepositAmount] = useState(0);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("invoices_log").insert({
        invoice_number: currentInvoiceNumber,
        title: title || null,
        total_amount: totalAmount,
        client_name: customerName || null,
        client_phone: customerPhone || null,
        project_title: title || null,
        created_by_email: user?.email || null,
      } as any);
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
        it.price > 0 ? `RM ${it.price.toFixed(0)}` : "-",
        `${it.quantity} ${it.quantity === 1 ? "UNIT" : "PCS"}`,
        it.price > 0 ? `RM ${(it.price * it.quantity).toLocaleString()}` : "-",
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
      renderTable(
        "Jersey",
        jerseyItems.filter((it) => it.description.trim() || it.price > 0 || it.quantity > 0),
      );
    }

    // Render add on items table (only if filled)
    if (hasDesignItems) {
      renderTable(
        "Add On Items",
        designItems.filter((it) => it.description.trim() || it.price > 0 || it.quantity > 0),
      );
    }

    y += 4;

    // Summary section - compact boxes, right-aligned like reference
    doc.setFont("kollektif", "bold");
    doc.setFontSize(9);

    const summaryRightEdge = pw - margin;
    const yellowW = 38;
    const cyanW = 50;
    const yellowX = summaryRightEdge - yellowW;
    const cyanX = yellowX - cyanW - 2;
    const labelRightX = cyanX - 4;
    const rowH = 8;

    // Build description lines for all items
    const orderDescLines: string[] = [];
    if (hasJerseyItems) {
      jerseyItems
        .filter((it) => it.description.trim() || it.price > 0 || it.quantity > 0)
        .forEach((it) => {
          orderDescLines.push(`${it.quantity} PCS ${it.description.toUpperCase()}`);
        });
    }
    if (hasDesignItems) {
      designItems
        .filter((it) => it.description.trim() || it.price > 0 || it.quantity > 0)
        .forEach((it) => {
          orderDescLines.push(`${it.quantity} PCS ${it.description.toUpperCase()}`);
        });
    }
    const row1H = Math.max(rowH, orderDescLines.length * 4 + 4);

    // Row 1: TOTAL ORDER (jersey + add on)
    doc.setFont("kollektif", "bold");
    doc.setFontSize(7);
    doc.text("TOTAL", labelRightX, y + row1H / 2 - 1, { align: "right" });
    doc.text("ORDER", labelRightX, y + row1H / 2 + 3, { align: "right" });

    doc.setFillColor(0, 220, 220);
    doc.rect(cyanX, y, cyanW, row1H, "F");
    doc.setTextColor(0);
    doc.setFontSize(6);
    let descY = y + 4;
    orderDescLines.forEach((line) => {
      const truncated = line.length > 28 ? line.substring(0, 26) + ".." : line;
      doc.text(truncated, cyanX + 1.5, descY);
      descY += 4;
    });

    doc.setFillColor(255, 213, 0);
    doc.rect(yellowX, y, yellowW, row1H, "F");
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.text(`RM ${totalAmount.toLocaleString()}`, yellowX + yellowW / 2, y + row1H / 2 + 1.5, { align: "center" });

    y += row1H + 2;

    // Row 2: LOCK DEPOSIT (only if filled)
    if (lockDepositAmount > 0) {
      doc.setFont("kollektif", "bold");
      doc.setFontSize(7);
      doc.text("LOCK DEPOSIT", labelRightX, y + rowH / 2 + 1, { align: "right" });

      doc.setFillColor(0, 220, 220);
      doc.rect(cyanX, y, cyanW, rowH, "F");
      doc.setTextColor(0);
      doc.setFontSize(7);
      doc.text("PAID", cyanX + cyanW / 2, y + rowH / 2 + 1, { align: "center" });

      doc.setFillColor(255, 213, 0);
      doc.rect(yellowX, y, yellowW, rowH, "F");
      doc.setTextColor(0);
      doc.setFontSize(8);
      doc.text(`RM ${lockDepositAmount.toLocaleString()}`, yellowX + yellowW / 2, y + rowH / 2 + 1, {
        align: "center",
      });

      y += rowH + 2;
    }

    // Row 3: Deposit (on total order = jersey + add on)
    const shirtDepositAmount = shirtDepositEnabled
      ? shirtDepositMode === "percent"
        ? (totalAmount * shirtDepositPercent) / 100
        : shirtDepositCustom
      : 0;
    const shirtDepositLabel = shirtDepositMode === "percent" ? `${shirtDepositPercent}%` : "DEPOSIT";
    doc.setFont("kollektif", "bold");
    doc.setFontSize(7);
    doc.text(shirtDepositLabel, labelRightX, y + rowH / 2 + 1, { align: "right" });

    doc.setFillColor(0, 220, 220);
    doc.rect(cyanX, y, cyanW, rowH, "F");

    doc.setFillColor(255, 213, 0);
    doc.rect(yellowX, y, yellowW, rowH, "F");
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.text(`RM ${shirtDepositAmount.toLocaleString()}`, yellowX + yellowW / 2, y + rowH / 2 + 1, { align: "center" });

    y += rowH + 2;

    // Row 4: BALANCE
    const balance = totalAmount - lockDepositAmount - shirtDepositAmount;
    doc.setFont("kollektif", "bold");
    doc.setFontSize(7);
    doc.text("BALANCE", labelRightX, y + rowH / 2 + 1, { align: "right" });

    doc.setFillColor(0, 220, 220);
    doc.rect(cyanX, y, cyanW, rowH, "F");

    doc.setFillColor(255, 213, 0);
    doc.rect(yellowX, y, yellowW, rowH, "F");
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.text(`RM ${balance.toLocaleString()}`, yellowX + yellowW / 2, y + rowH / 2 + 1, { align: "center" });

    doc.setTextColor(0);

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

    const safeTitle = title ? `_${title.replace(/[^a-zA-Z0-9]/g, "_")}` : "";
    doc.save(`Invoice_${currentInvoiceNumber.replace(/\//g, "-")}${safeTitle}.pdf`);
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
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={generateInvoiceNumber}
                      disabled={isGeneratingNumber}
                      title="Generate invoice number"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingNumber ? "animate-spin" : ""}`} />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setIsInvoiceNumberLocked(false)}
                      title="Amend invoice number"
                    >
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
              <Input
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Contact Number</label>
              <Input
                placeholder="e.g. +60 12-345 6789"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Address</label>
              <Textarea
                placeholder="Customer address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="text-xs"
                rows={2}
              />
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
              <Input
                placeholder="VNECK CROSS SHORTSLEEVE + NAMESET"
                value={item.description}
                onChange={(e) => updateJerseyItem(i, "description", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price (RM)"
                value={item.price || ""}
                onChange={(e) => updateJerseyItem(i, "price", parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity || ""}
                onChange={(e) => updateJerseyItem(i, "quantity", parseInt(e.target.value) || 0)}
              />
              <div className="text-sm font-medium text-right">RM {(item.price * item.quantity).toLocaleString()}</div>
              {jerseyItems.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeJerseyItem(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="checkbox"
                checked={shirtDepositEnabled}
                onChange={(e) => setShirtDepositEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs">Deposit (on Total Order)</span>
              <select
                value={shirtDepositMode}
                onChange={(e) => setShirtDepositMode(e.target.value as "percent" | "custom")}
                disabled={!shirtDepositEnabled}
                className="h-7 text-xs rounded border border-input bg-background px-2"
              >
                <option value="percent">%</option>
                <option value="custom">RM</option>
              </select>
              {shirtDepositMode === "percent" ? (
                <>
                  <Input
                    type="number"
                    value={shirtDepositPercent}
                    onChange={(e) => setShirtDepositPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 h-7 text-xs"
                    disabled={!shirtDepositEnabled}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </>
              ) : (
                <Input
                  type="number"
                  value={shirtDepositCustom || ""}
                  onChange={(e) => setShirtDepositCustom(parseFloat(e.target.value) || 0)}
                  className="w-24 h-7 text-xs"
                  disabled={!shirtDepositEnabled}
                  placeholder="Amount"
                />
              )}
              {shirtDepositEnabled && (
                <span className="text-xs font-medium ml-2">
                  = RM{" "}
                  {(shirtDepositMode === "percent"
                    ? (totalAmount * shirtDepositPercent) / 100
                    : shirtDepositCustom
                  ).toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-6 text-sm font-semibold">
              <span>Total: {jerseyPcs} PCS</span>
              <span>RM {jerseyAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add On Items */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Add On Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addDesignItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {designItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_100px_36px] gap-2 items-center">
              <Input
                placeholder="LOGO DESIGN / MOCKUP"
                value={item.description}
                onChange={(e) => updateDesignItem(i, "description", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price (RM)"
                value={item.price || ""}
                onChange={(e) => updateDesignItem(i, "price", parseFloat(e.target.value) || 0)}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity || ""}
                onChange={(e) => updateDesignItem(i, "quantity", parseInt(e.target.value) || 0)}
              />
              <div className="text-sm font-medium text-right">RM {(item.price * item.quantity).toLocaleString()}</div>
              {designItems.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDesignItem(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-end pt-3 border-t">
            <div className="flex gap-6 text-sm font-semibold">
              <span>Total: {designPcs} PCS</span>
              <span>RM {designAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lock Deposit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Lock Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Lock Deposit Amount (RM)</label>
            <Input
              type="number"
              placeholder="0"
              value={lockDepositAmount || ""}
              onChange={(e) => setLockDepositAmount(parseFloat(e.target.value) || 0)}
              className="w-40"
            />
            {lockDepositAmount > 0 && (
              <span className="text-xs font-medium">RM {lockDepositAmount.toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Amount paid by customer to lock the order. Leave 0 or empty to hide from invoice.
          </p>
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
