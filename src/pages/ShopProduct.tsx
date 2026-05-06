import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  images: string[];
};

type Variant = {
  id: string;
  option_type: string;
  option_value: string;
  price_delta: number;
};

const ShopProduct = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: p } = await supabase
        .from("products")
        .select("id, slug, name, description, category, base_price, images")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (p) {
        setProduct(p as Product);
        document.title = `${p.name} – ACD Jersey Shop`;
        const { data: v } = await supabase
          .from("product_variants")
          .select("id, option_type, option_value, price_delta")
          .eq("product_id", p.id)
          .eq("is_active", true)
          .order("display_order");
        setVariants((v as Variant[]) || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const groupedVariants = useMemo(() => {
    const g: Record<string, Variant[]> = {};
    variants.forEach((v) => {
      g[v.option_type] = g[v.option_type] || [];
      g[v.option_type].push(v);
    });
    return g;
  }, [variants]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    let total = Number(product.base_price);
    Object.entries(selected).forEach(([type, value]) => {
      const v = variants.find((x) => x.option_type === type && x.option_value === value);
      if (v) total += Number(v.price_delta);
    });
    return total;
  }, [product, selected, variants]);

  const handleAdd = () => {
    if (!product) return;
    const requiredTypes = Object.keys(groupedVariants);
    for (const t of requiredTypes) {
      if (!selected[t]) {
        toast.error(`Please choose ${t}`);
        return;
      }
    }
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images?.[0],
      unitPrice,
      quantity: qty,
      selectedOptions: selected,
    });
    toast.success("Added to cart");
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><p className="text-center text-muted-foreground py-20">Loading...</p></div>;
  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-20 text-center space-y-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild><Link to="/shop">Back to Shop</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <section className="container max-w-6xl py-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              {product.images?.[activeImg] ? (
                <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition ${i === activeImg ? "border-accent" : "border-border"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.category && <p className="text-xs uppercase tracking-wider text-accent font-display">{product.category}</p>}
            <h1 className="text-3xl md:text-4xl font-display">{product.name}</h1>
            <p className="text-2xl font-display text-accent">RM {unitPrice.toFixed(2)}</p>
            {product.description && <p className="text-muted-foreground whitespace-pre-line text-sm">{product.description}</p>}

            {/* Variants */}
            {Object.entries(groupedVariants).map(([type, opts]) => (
              <div key={type} className="space-y-2">
                <p className="font-display text-sm uppercase tracking-wider">{type}</p>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelected((s) => ({ ...s, [type]: o.option_value }))}
                      className={`px-4 py-2 rounded-md border text-sm transition ${
                        selected[type] === o.option_value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      {o.option_value}
                      {Number(o.price_delta) !== 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({Number(o.price_delta) > 0 ? "+" : ""}RM{Number(o.price_delta).toFixed(2)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="space-y-2">
              <p className="font-display text-sm uppercase tracking-wider">Quantity</p>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center font-display">{qty}</span>
                <Button size="icon" variant="outline" onClick={() => setQty((q) => q + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={handleAdd}>
              Add to Cart — RM {(unitPrice * qty).toFixed(2)}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopProduct;
