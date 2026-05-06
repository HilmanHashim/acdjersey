import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

type Zone = { id: string; name: string; fee: number; states: string[]; is_default: boolean };

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name required").max(100),
  customer_phone: z.string().trim().min(5, "Phone required").max(30),
  customer_email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  shipping_address: z.string().trim().min(5, "Address required").max(500),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    notes: "",
  });

  useEffect(() => { document.title = "Checkout – ACD Jersey"; }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("shipping_zones")
        .select("id,name,fee,states,is_default")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      const list = (data || []) as Zone[];
      setZones(list);
      const def = list.find((z) => z.is_default) || list[0];
      if (def) setZoneId(def.id);
    })();
  }, []);

  const selectedZone = useMemo(() => zones.find((z) => z.id === zoneId), [zones, zoneId]);
  const shippingFee = selectedZone?.fee ?? 0;
  const total = subtotal + shippingFee;

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Please check your inputs");
      return;
    }

    setSubmitting(true);
    try {
      const { data: numData, error: numErr } = await supabase.rpc("generate_shop_order_number");
      if (numErr) throw numErr;
      const order_number = numData as string;

      const { data: order, error: orderErr } = await supabase
        .from("shop_orders")
        .insert({
          order_number,
          status: "pending",
          payment_status: "unpaid",
          customer_name: parsed.data.customer_name,
          customer_phone: parsed.data.customer_phone,
          customer_email: parsed.data.customer_email || null,
          shipping_address: parsed.data.shipping_address,
          notes: [parsed.data.notes || null, selectedZone ? `Shipping zone: ${selectedZone.name}` : null].filter(Boolean).join(" | ") || null,
          subtotal,
          shipping_fee: shippingFee,
          total_amount: total,
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: i.name,
        selected_options: i.selectedOptions,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        line_total: i.unitPrice * i.quantity,
      }));
      const { error: itemsErr } = await supabase.from("shop_order_items").insert(itemsPayload);
      if (itemsErr) throw itemsErr;

      clear();
      navigate(`/order-submitted?order=${encodeURIComponent(order_number)}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center space-y-4">
          <h1 className="text-2xl font-display">Your cart is empty</h1>
          <Button asChild><Link to="/shop">Browse Shop</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container max-w-5xl py-10">
        <h1 className="text-3xl md:text-4xl font-display text-gradient mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.customer_name} onChange={(e) => setField("customer_name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" value={form.customer_phone} onChange={(e) => setField("customer_phone", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" value={form.customer_email} onChange={(e) => setField("customer_email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Shipping Address *</Label>
              <Textarea id="address" rows={3} value={form.shipping_address} onChange={(e) => setField("shipping_address", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Place Order"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Online payment is coming soon. After you place the order, our team will contact you to confirm payment & shipping.
            </p>
          </form>

          <div className="space-y-4">
            <h2 className="font-display text-xl">Order Summary</h2>
            <div className="border border-border rounded-lg divide-y divide-border">
              {items.map((i) => (
                <div key={i.id} className="p-3 flex gap-3 text-sm">
                  {i.image && <img src={i.image} alt={i.name} className="w-14 h-14 object-cover rounded" />}
                  <div className="flex-1">
                    <p className="font-display">{i.name}</p>
                    {Object.entries(i.selectedOptions).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(i.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">Qty: {i.quantity}</p>
                  </div>
                  <p className="text-accent">RM {(i.unitPrice * i.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="p-3 flex justify-between font-display">
                <span>Subtotal</span>
                <span className="text-accent">RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>To be confirmed</span>
              </div>
              <div className="p-3 flex justify-between font-display text-lg">
                <span>Total</span>
                <span className="text-accent">RM {subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Checkout;
