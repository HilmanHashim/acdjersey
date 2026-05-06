import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

type Zone = {
  id: string;
  name: string;
  fee: number;
  states: string[];
  is_default: boolean;
  is_active: boolean;
  display_order: number;
};

const empty = { name: "", fee: 0, states: "", is_default: false, is_active: true, display_order: 0 };

const ShippingZonesTab = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shipping_zones")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    else setZones((data || []) as Zone[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addZone = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { error } = await supabase.from("shipping_zones").insert({
      name: form.name.trim(),
      fee: Number(form.fee) || 0,
      states: form.states.split(",").map((s) => s.trim()).filter(Boolean),
      is_default: form.is_default,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 0,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Zone added");
    setForm({ ...empty });
    load();
  };

  const updateZone = async (z: Zone, patch: Partial<Zone>) => {
    const { error } = await supabase.from("shipping_zones").update(patch).eq("id", z.id);
    if (error) { toast.error(error.message); return; }
    setZones((arr) => arr.map((x) => (x.id === z.id ? { ...x, ...patch } : x)));
  };

  const deleteZone = async (id: string) => {
    if (!confirm("Delete this zone?")) return;
    const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setZones((arr) => arr.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl mb-1">Shipping / Postage Fees</h2>
        <p className="text-sm text-muted-foreground">Customers pick a zone at checkout. The default zone is preselected.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : zones.length === 0 ? (
          <p className="text-muted-foreground text-sm">No shipping zones yet.</p>
        ) : zones.map((z) => (
          <div key={z.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={z.name} onChange={(e) => updateZone(z, { name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fee (RM)</Label>
                <Input type="number" step="0.01" value={z.fee}
                  onChange={(e) => updateZone(z, { fee: Number(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Display Order</Label>
                <Input type="number" value={z.display_order}
                  onChange={(e) => updateZone(z, { display_order: Number(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={z.is_active} onCheckedChange={(v) => updateZone(z, { is_active: v })} />
                  <Label className="text-xs">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={z.is_default} onCheckedChange={(v) => updateZone(z, { is_default: v })} />
                  <Label className="text-xs">Default</Label>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">States covered (comma-separated)</Label>
              <Textarea rows={2} value={z.states.join(", ")}
                onChange={(e) => updateZone(z, { states: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => deleteZone(z.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
        <h3 className="font-display">Add new zone</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <Input placeholder="Name (e.g. West Malaysia)" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Fee (RM)" value={form.fee}
            onChange={(e) => setForm({ ...form, fee: Number(e.target.value) || 0 })} />
          <Input type="number" placeholder="Display order" value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })} />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label className="text-xs">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
              <Label className="text-xs">Default</Label>
            </div>
          </div>
        </div>
        <Textarea placeholder="States covered (comma-separated, optional)" rows={2} value={form.states}
          onChange={(e) => setForm({ ...form, states: e.target.value })} />
        <Button onClick={addZone} disabled={saving} variant="hero">
          <Plus className="h-4 w-4 mr-1" /> Add Zone
        </Button>
      </div>
    </div>
  );
};

export default ShippingZonesTab;
