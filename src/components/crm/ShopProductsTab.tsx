import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Edit, X, Upload } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  images: string[];
  is_active: boolean;
  display_order: number;
};

type Variant = {
  id?: string;
  product_id?: string;
  option_type: string;
  option_value: string;
  price_delta: number;
  is_active: boolean;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyForm = (): Omit<Product, "id"> & { id?: string } => ({
  slug: "",
  name: "",
  description: "",
  category: "",
  base_price: 0,
  images: [],
  is_active: true,
  display_order: 0,
});

const ShopProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: string }>(emptyForm());
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("display_order")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(emptyForm());
    setVariants([]);
    setOpen(true);
  };

  const openEdit = async (p: Product) => {
    setForm({ ...p });
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", p.id)
      .order("display_order");
    setVariants((data as Variant[]) || []);
    setOpen(true);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success("Image(s) uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addVariant = () =>
    setVariants((v) => [...v, { option_type: "size", option_value: "", price_delta: 0, is_active: true }]);
  const updateVariant = (i: number, patch: Partial<Variant>) =>
    setVariants((v) => v.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    const slug = (form.slug || slugify(form.name)).trim();
    if (!slug) { toast.error("Slug required"); return; }

    setSaving(true);
    try {
      const payload = {
        slug,
        name: form.name,
        description: form.description || null,
        category: form.category || null,
        base_price: Number(form.base_price) || 0,
        images: form.images,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      };

      let productId = form.id;
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("products")
          .insert({ ...payload, created_by: user?.id })
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Replace variants
      if (productId) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
        const valid = variants.filter((v) => v.option_type.trim() && v.option_value.trim());
        if (valid.length > 0) {
          const { error: vErr } = await supabase.from("product_variants").insert(
            valid.map((v, i) => ({
              product_id: productId,
              option_type: v.option_type.trim(),
              option_value: v.option_value.trim(),
              price_delta: Number(v.price_delta) || 0,
              is_active: v.is_active,
              display_order: i,
            }))
          );
          if (vErr) throw vErr;
        }
      }

      toast.success("Saved");
      setOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl">Shop Products</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (RM)</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No products yet.</TableCell></TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.images?.[0] ? <img src={p.images[0]} className="w-12 h-12 object-cover rounded" alt="" /> : <div className="w-12 h-12 bg-muted rounded" />}
                  </TableCell>
                  <TableCell className="font-display">{p.name}<div className="text-xs text-muted-foreground">/{p.slug}</div></TableCell>
                  <TableCell>{p.category || "—"}</TableCell>
                  <TableCell>{Number(p.base_price).toFixed(2)}</TableCell>
                  <TableCell><Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={form.category || ""} placeholder="e.g. Long Sleeve" onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Base Price (RM) *</Label>
                <Input type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active (visible in shop)</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-20 h-20 object-cover rounded border border-border" alt="" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-accent">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
                </label>
              </div>
              {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variants (size, fabric, collar, etc.)</Label>
                <Button size="sm" variant="outline" onClick={addVariant}><Plus className="h-3 w-3 mr-1" /> Add Variant</Button>
              </div>
              {variants.length === 0 && <p className="text-xs text-muted-foreground">No variants. Add options like size or fabric.</p>}
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-3" placeholder="Type (size)" value={v.option_type} onChange={(e) => updateVariant(i, { option_type: e.target.value })} />
                  <Input className="col-span-4" placeholder="Value (M)" value={v.option_value} onChange={(e) => updateVariant(i, { option_value: e.target.value })} />
                  <Input className="col-span-3" type="number" step="0.01" placeholder="+ Price" value={v.price_delta} onChange={(e) => updateVariant(i, { price_delta: parseFloat(e.target.value) || 0 })} />
                  <div className="col-span-1 flex justify-center"><Switch checked={v.is_active} onCheckedChange={(val) => updateVariant(i, { is_active: val })} /></div>
                  <Button size="icon" variant="ghost" className="col-span-1 text-destructive" onClick={() => removeVariant(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopProductsTab;
