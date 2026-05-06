import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  images: string[];
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("ALL");

  useEffect(() => {
    document.title = "Shop – ACD Jersey";
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, description, category, base_price, images")
        .eq("is_active", true)
        .order("display_order")
        .order("created_at", { ascending: false });
      setProducts((data as Product[]) || []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filtered = category === "ALL" ? products : products.filter((p) => p.category === category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 text-center space-y-4">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Shop</p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient inline-block">ACD Merch</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Browse our selection of premium jerseys and apparel — order online and we'll be in touch.
        </p>
      </section>

      <section className="container max-w-6xl pb-20">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                onClick={() => setCategory(c)}
                className="font-display text-xs uppercase tracking-wider"
              >
                {c}
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No products available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/shop/${p.slug}`}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  {p.category && <p className="text-[10px] uppercase tracking-wider text-accent font-display">{p.category}</p>}
                  <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                  <p className="text-accent font-display">RM {Number(p.base_price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
