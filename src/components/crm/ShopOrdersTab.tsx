import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  notes: string | null;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  created_at: string;
};

type Item = {
  id: string;
  product_name: string;
  selected_options: Record<string, string>;
  quantity: number;
  unit_price: number;
  line_total: number;
};

const STATUSES = ["pending", "contacted", "paid", "shipped", "completed", "cancelled"];

const ShopOrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shop_orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetails = async (o: Order) => {
    setOpenOrder(o);
    const { data } = await supabase.from("shop_order_items").select("*").eq("order_id", o.id);
    setItems((data as Item[]) || []);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("shop_orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); load(); if (openOrder?.id === id) setOpenOrder({ ...openOrder, status }); }
  };

  const handleDelete = async (o: Order) => {
    if (!confirm(`Delete order ${o.order_number}?`)) return;
    const { error } = await supabase.from("shop_orders").delete().eq("id", o.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">Shop Orders</h2>
      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No orders yet.</TableCell></TableRow>
              ) : orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                  <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell>{o.customer_phone}</TableCell>
                  <TableCell>RM {Number(o.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openDetails(o)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(o)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!openOrder} onOpenChange={(v) => !v && setOpenOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order {openOrder?.order_number}</DialogTitle></DialogHeader>
          {openOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><strong>Customer:</strong> {openOrder.customer_name}</div>
                <div><strong>Phone:</strong> {openOrder.customer_phone}</div>
                <div><strong>Email:</strong> {openOrder.customer_email || "—"}</div>
                <div><strong>Status:</strong> {openOrder.status}</div>
                <div className="col-span-2"><strong>Shipping:</strong> {openOrder.shipping_address}</div>
                {openOrder.notes && <div className="col-span-2"><strong>Notes:</strong> {openOrder.notes}</div>}
              </div>

              <div className="border border-border rounded">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Item</TableHead><TableHead>Options</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.product_name}</TableCell>
                        <TableCell className="text-xs">{Object.entries(i.selected_options || {}).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"}</TableCell>
                        <TableCell>{i.quantity}</TableCell>
                        <TableCell>RM {Number(i.line_total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end font-display text-lg">
                Total: <span className="text-accent ml-2">RM {Number(openOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopOrdersTab;
