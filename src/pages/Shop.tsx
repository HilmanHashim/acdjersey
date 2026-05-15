import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-jersey-flatlay.jpg";

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

      {/* Hero — single image, compact */}
      <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden surface-dark">
        <img
          src={heroImage}
          alt="Jersey flatlay"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="container relative z-10 h-full flex items-end pb-16 md:pb-20">
          <div className="max-w-3xl space-y-4">
            <p className="font-display text-white/80 uppercase tracking-[0.4em] text-xs md:text-sm opacity-0 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              New Season Drop
            </p>
            <h1 className="font-display text-white text-[12vw] md:text-[7vw] leading-[0.85] uppercase font-black tracking-tighter opacity-0 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              Wear The
              <br />
              <span className="text-gradient">Win.</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 font-body max-w-xl opacity-0 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              Premium sublimation apparel built in Shah Alam. Shop the latest ACD Merch — engineered for performance, designed to stand out.
            </p>
          </div>
        </div>
      </section>

      {/* Section heading */}
      <section className="container max-w-7xl pt-16 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="font-display text-accent uppercase tracking-[0.3em] text-xs mb-2">ACD Merch</p>
            <h2 className="text-3xl md:text-5xl font-display uppercase font-black tracking-tight">
              Shop The Latest
            </h2>
          </div>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                  className="rounded-full font-display text-xs uppercase tracking-wider"
                >
                  {c}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product grid — flat Nike-style cards */}
      <section className="container max-w-7xl pb-24">
        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No products available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/shop/${p.slug}`}
                className="group block"
              >
                <div className="aspect-square overflow-hidden bg-muted rounded-sm">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                </div>
                <div className="pt-4 space-y-0.5">
                  {p.category && (
                    <p className="text-[11px] uppercase tracking-wider text-accent font-display">{p.category}</p>
                  )}
                  <h3 className="font-display text-base text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">Premium Sublimation</p>
                  <p className="pt-1 font-display text-foreground">RM {Number(p.base_price).toFixed(2)}</p>
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
