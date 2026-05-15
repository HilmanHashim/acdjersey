import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import slide2 from "@/assets/hero-jersey-flatlay.jpg";
import slide1 from "@/assets/hero-bg.jpg";
import slide3 from "@/assets/hero-jerseys.jpg";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  images: string[];
};

type Slide = {
  image: string;
  alt: string;
};

const slides: Slide[] = [
  { image: slide2, alt: "Jersey flatlay" },
  { image: slide1, alt: "Hero background" },
  { image: slide3, alt: "Jerseys collection" },
];

const SLIDE_DURATION = 6000;

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("ALL");

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(Date.now());

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

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    if (!isPlaying) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(p);
      if (p >= 1) setIndex((i) => (i + 1) % slides.length);
    }, 50);
    return () => clearInterval(tick);
  }, [index, isPlaying]);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filtered = category === "ALL" ? products : products.filter((p) => p.category === category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero carousel — landing-page style */}
      <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden surface-dark">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <img
              src={s.image}
              alt={s.alt}
              className="w-full h-full object-cover scale-105"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        ))}

        <div className="container relative z-10 h-full flex items-end pb-24 md:pb-28">
          <div className="max-w-3xl space-y-5">
            <p className="font-display text-white/80 uppercase tracking-[0.4em] text-xs md:text-sm opacity-0 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              New Season Drop
            </p>
            <h1 className="font-display text-white text-[15vw] md:text-[9vw] leading-[0.85] uppercase font-black tracking-tighter opacity-0 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              Wear The
              <br />
              <span className="text-gradient">Win.</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 font-body max-w-xl opacity-0 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              Premium sublimation apparel built in Shah Alam. Shop the latest ACD Merch — engineered for performance, designed to stand out.
            </p>
            <div className="flex flex-wrap gap-3 pt-3 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <Button
                size="lg"
                className="rounded-full bg-white text-black hover:bg-white/90 font-display uppercase tracking-wider px-7 transition-transform hover:scale-105"
              >
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white hover:text-black font-display uppercase tracking-wider px-7 transition-transform hover:scale-105"
              >
                <Link to="/catalogue">
                  Explore Catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Playback controls */}
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="relative h-9 w-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition flex items-center justify-center"
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress)}`}
                style={{ transition: "stroke-dashoffset 50ms linear" }}
              />
            </svg>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="bg-black text-white overflow-hidden border-y border-white/10">
        <div className="flex w-max py-3 animate-marquee will-change-transform">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
              {[
                "Custom Sublimation Jerseys",
                "Fast Turnaround",
                "Free Design Consultation",
                "Trusted Across Malaysia",
                "Bulk Orders Welcome",
                "Premium Performance Fabric",
              ].map((t, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="font-display uppercase tracking-[0.3em] text-sm px-8 flex items-center gap-8 whitespace-nowrap"
                >
                  {t}
                  <span className="text-accent">★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

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
