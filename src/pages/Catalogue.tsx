import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import fabricTypes from "@/assets/catalogue/fabric-types.png";
import collarTypes from "@/assets/catalogue/collar-types.png";

// Load all category images via glob; pick first N for the preview carousel.
const collaredImgs = import.meta.glob("@/assets/catalogue/collared/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const longsleeveImgs = import.meta.glob("@/assets/catalogue/longsleeve/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const singletImgs = import.meta.glob("@/assets/catalogue/singlet/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const standardImgs = import.meta.glob("@/assets/catalogue/standard/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const previewImages = (m: Record<string, string>, n = 5) =>
  Object.entries(m)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, n)
    .map(([, v]) => v);

type Category = {
  slug: string;
  title: string;
  description: string;
  images: string[];
  totalCount: number;
};

const categories: Category[] = [
  {
    slug: "long-sleeve",
    title: "Long Sleeve / MUSLIMAH",
    description: "Premium long sleeve jerseys for comfort & performance.",
    images: previewImages(longsleeveImgs),
    totalCount: Object.keys(longsleeveImgs).length,
  },
  {
    slug: "singlet",
    title: "Singlet",
    description: "Lightweight singlets for high-intensity activities.",
    images: previewImages(singletImgs),
    totalCount: Object.keys(singletImgs).length,
  },
  {
    slug: "collared",
    title: "Collared",
    description: "Professional collared jerseys for events & teams.",
    images: previewImages(collaredImgs),
    totalCount: Object.keys(collaredImgs).length,
  },
  {
    slug: "standard-cutting",
    title: "Standard Cutting",
    description: "Classic versatile jersey cuts for any occasion.",
    images: previewImages(standardImgs),
    totalCount: Object.keys(standardImgs).length,
  },
];

/* ─── Category card: preview carousel that links to a sub-page ─── */
const CategoryCard = ({ category }: { category: Category }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const total = category.images.length;

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % total;
        const el = scrollRef.current;
        if (el) {
          const child = el.children[next] as HTMLElement;
          if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [total]);

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1));
    setCurrent(clamped);
    const el = scrollRef.current;
    if (el) {
      const child = el.children[clamped] as HTMLElement;
      if (child) {
        el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      }
    }
  };

  // Stop link navigation when interacting with carousel controls
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      to={`/catalogue/${category.slug}`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-500"
    >
      {/* Image carousel area */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pointer-events-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {category.images.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-start w-full aspect-square overflow-hidden"
            >
              <img
                src={src}
                alt={`${category.title} ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Hover overlay with "View all" hint */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-16">
          <span className="font-display text-sm uppercase tracking-[0.2em] text-foreground bg-card/90 backdrop-blur px-4 py-2 rounded-full border border-border inline-flex items-center gap-2">
            View all <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { stop(e); scrollTo(current - 1); }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur border border-border rounded-full p-1.5 transition-opacity shadow-md ${
                current > 0 ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              type="button"
              onClick={(e) => { stop(e); scrollTo(current + 1); }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur border border-border rounded-full p-1.5 transition-opacity shadow-md ${
                current < total - 1 ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {category.images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { stop(e); scrollTo(i); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 h-1.5 bg-accent"
                    : "w-1.5 h-1.5 bg-foreground/30 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-1 border-t border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-foreground">{category.title}</h3>
          <span className="text-xs text-muted-foreground font-display">
            {category.totalCount} design{category.totalCount !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {category.description}
        </p>
      </div>
    </Link>
  );
};

const Catalogue = () => {
  const leftCol = [categories[0], categories[1]];
  const rightCol = [categories[2], categories[3]];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 text-center space-y-4 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">
          Browse
        </p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient">
          Our Catalogue
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          A sample of our design capabilities — all jerseys are fully customizable to your needs.
        </p>
      </section>

      {/* 2x2 Grid */}
      <section className="container max-w-6xl pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {leftCol.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
          <div className="space-y-6">
            {rightCol.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container max-w-6xl">
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </div>

      {/* Fabric Types */}
      <section className="container max-w-6xl py-16 space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Materials</p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient">Fabric Types</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Choose from our range of premium fabrics — each suited for different needs and comfort levels.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500">
          <img src={fabricTypes} alt="Available fabric types — Interlock, Pin Dot Mesh, Mini Eyelet, Eyelet Reverse, RJPK, Premium Lycra, Lycra Standard, High Grade Diamond Hexagon, Ultron Superlite, Mini Square" className="w-full h-auto" loading="lazy" />
        </div>
      </section>

      {/* Divider */}
      <div className="container max-w-6xl">
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </div>

      {/* Collar Types */}
      <section className="container max-w-6xl py-16 pb-20 space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Customization</p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient">Collar Types</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Select your preferred collar style — from classic roundneck to polo and mandarin options.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500">
          <img src={collarTypes} alt="Available collar types — Roundneck, V-Neck End, V-Neck Cross, V-Neck Flat, Insert Stub, Open Stub, Polo Retro String, Polo Retro, Polo, Mandarin, Mandarin Zip" className="w-full h-auto" loading="lazy" />
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="container max-w-6xl pb-20 text-center space-y-4 animate-slide-up">
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-10" />
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Want More?</p>
        <h2 className="text-2xl md:text-4xl font-display text-foreground">
          Click on our Telegram for more designs
        </h2>
        <a
          href="https://t.me/acdjersey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#229ED9] hover:bg-[#1a8abf] text-white font-display text-lg px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          @acdjersey
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default Catalogue;
