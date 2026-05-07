import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, ArrowUpRight, X, Sparkles, MessageCircle } from "lucide-react";

import fabricTypes from "@/assets/catalogue/fabric-types.png";
import collarTypes from "@/assets/catalogue/collar-types.png";

// Load all category images
const collaredImgs = import.meta.glob("@/assets/catalogue/collared/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const longsleeveImgs = import.meta.glob("@/assets/catalogue/longsleeve/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const singletImgs = import.meta.glob("@/assets/catalogue/singlet/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const standardImgs = import.meta.glob("@/assets/catalogue/standard/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const sortedUrls = (m: Record<string, string>) =>
  Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

const previewImages = (m: Record<string, string>, n = 5) => sortedUrls(m).slice(0, n);

type Category = {
  slug: string;
  index: string;
  title: string;
  shortTitle: string;
  description: string;
  images: string[];
  totalCount: number;
};

const categories: Category[] = [
  {
    slug: "long-sleeve",
    index: "01",
    title: "Long Sleeve / Muslimah",
    shortTitle: "Long Sleeve",
    description: "Premium long sleeve jerseys for comfort & performance.",
    images: previewImages(longsleeveImgs),
    totalCount: Object.keys(longsleeveImgs).length,
  },
  {
    slug: "singlet",
    index: "02",
    title: "Singlet",
    shortTitle: "Singlet",
    description: "Lightweight singlets for high-intensity activities.",
    images: previewImages(singletImgs),
    totalCount: Object.keys(singletImgs).length,
  },
  {
    slug: "collared",
    index: "03",
    title: "Collared",
    shortTitle: "Collared",
    description: "Professional collared jerseys for events & teams.",
    images: previewImages(collaredImgs),
    totalCount: Object.keys(collaredImgs).length,
  },
  {
    slug: "standard-cutting",
    index: "04",
    title: "Standard Cutting",
    shortTitle: "Standard",
    description: "Classic versatile jersey cuts for any occasion.",
    images: previewImages(standardImgs),
    totalCount: Object.keys(standardImgs).length,
  },
];

/* ────────────────────────────────────────────────────────── */
/* CategoryTile — bento card with crossfade preview           */
/* ────────────────────────────────────────────────────────── */
const CategoryTile = ({
  category,
  feature = false,
}: {
  category: Category;
  feature?: boolean;
}) => {
  const [current, setCurrent] = useState(0);
  const total = category.images.length;

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total]);

  return (
    <Link
      to={`/catalogue/${category.slug}`}
      className={`group relative block overflow-hidden rounded-3xl bg-card border border-border hover:border-accent/50 transition-all duration-500 ${
        feature ? "md:row-span-2 aspect-[4/5] md:aspect-auto" : "aspect-[4/3]"
      }`}
    >
      {/* Crossfading preview stack */}
      <div className="absolute inset-0">
        {category.images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${category.title} ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-out ${
              i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } group-hover:scale-110`}
          />
        ))}
      </div>

      {/* Top gradient for badge legibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/70 to-transparent pointer-events-none" />
      {/* Bottom gradient for label legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

      {/* Index badge */}
      <div className="absolute top-5 left-5 z-10">
        <span className="font-display text-xs uppercase tracking-[0.3em] text-foreground/80">
          {category.index} / 04
        </span>
      </div>

      {/* Count pill */}
      <div className="absolute top-5 right-5 z-10">
        <span className="font-display text-[10px] uppercase tracking-[0.2em] bg-foreground/10 backdrop-blur-md border border-foreground/20 text-foreground px-3 py-1.5 rounded-full">
          {category.totalCount} designs
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-10">
        <h3 className={`font-display text-foreground leading-none mb-2 ${feature ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
          {category.title}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mb-4">
          {category.description}
        </p>
        <span className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-accent">
          Explore the range
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>

        {/* Thumbnail strip — visible on hover (desktop) */}
        <div className="hidden md:flex gap-2 mt-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          {category.images.slice(0, 4).map((src, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-accent" : "border-foreground/20"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 right-5 flex gap-1.5 z-10 md:hidden">
          {category.images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === current ? "w-4 bg-accent" : "w-1 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </Link>
  );
};

/* ────────────────────────────────────────────────────────── */
/* Section header — editorial style                            */
/* ────────────────────────────────────────────────────────── */
const SectionHeader = ({
  index,
  eyebrow,
  title,
  subtitle,
}: {
  index: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="font-display text-xs uppercase tracking-[0.3em] text-accent">
          {index} / {eyebrow}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent w-16" />
      </div>
      <h2 className="text-4xl md:text-6xl font-display text-foreground leading-[0.95]">
        {title}
      </h2>
      {subtitle && <p className="text-muted-foreground text-base max-w-xl">{subtitle}</p>}
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────── */
/* Spec swatch grid (Fabrics / Collars)                        */
/* ────────────────────────────────────────────────────────── */
const FABRICS = [
  { name: "Interlock", note: "Soft, structured. All-day comfort." },
  { name: "Pin Dot Mesh", note: "Light & breathable for active wear." },
  { name: "Mini Eyelet", note: "Cooling micro-perforations." },
  { name: "Eyelet Reverse", note: "Textured back for grip & airflow." },
  { name: "RJPK", note: "Smooth knit, premium drape." },
  { name: "Premium Lycra", note: "Stretch & shape retention." },
  { name: "Lycra Standard", note: "Reliable everyday stretch." },
  { name: "HG Diamond Hexagon", note: "High-performance honeycomb weave." },
  { name: "Ultron Superlite", note: "Ultra-light competition fabric." },
  { name: "Mini Square", note: "Classic micro-textured finish." },
];

const COLLARS = [
  { name: "Roundneck" },
  { name: "V-Neck End" },
  { name: "V-Neck Cross" },
  { name: "V-Neck Flat" },
  { name: "Insert Stub" },
  { name: "Open Stub" },
  { name: "Polo Retro String" },
  { name: "Polo Retro" },
  { name: "Polo" },
  { name: "Mandarin" },
  { name: "Mandarin Zip" },
];

const SwatchGrid = ({
  items,
  onOpen,
}: {
  items: { name: string; note?: string }[];
  onOpen: () => void;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {items.map((item, i) => (
      <button
        key={item.name}
        onClick={onOpen}
        className="group/swatch relative text-left rounded-xl border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all duration-300 p-4 overflow-hidden"
      >
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-display text-[10px] text-muted-foreground tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-border group-hover/swatch:bg-accent/40 transition-colors" />
        </div>
        <p className="font-display text-sm text-foreground leading-tight mb-1">
          {item.name}
        </p>
        {item.note && (
          <p className="text-[11px] text-muted-foreground leading-snug">{item.note}</p>
        )}
        <ArrowUpRight className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/swatch:opacity-100 group-hover/swatch:text-accent transition-all" />
      </button>
    ))}
  </div>
);

/* ────────────────────────────────────────────────────────── */
/* Sticky chip nav                                             */
/* ────────────────────────────────────────────────────────── */
const SECTIONS = [
  ...categories.map((c) => ({ id: c.slug, label: c.shortTitle })),
  { id: "fabrics", label: "Fabrics" },
  { id: "collars", label: "Collars" },
];

const ChipNav = () => {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-y border-border">
      <div className="container max-w-6xl flex gap-2 overflow-x-auto py-3 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`flex-shrink-0 font-display text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-300 ${
              active === s.id
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent/50"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/* Page                                                        */
/* ────────────────────────────────────────────────────────── */
const Catalogue = () => {
  const [lightbox, setLightbox] = useState<null | "fabric" | "collar">(null);

  // Hero collage uses a few jerseys across categories
  const heroCollage = useMemo(
    () => [
      previewImages(longsleeveImgs, 1)[0],
      previewImages(collaredImgs, 1)[0],
      previewImages(singletImgs, 1)[0],
      previewImages(standardImgs, 1)[0],
    ].filter(Boolean),
    []
  );

  // Update document meta for shareable previews
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "ACD Catalogue — Custom Jerseys, Fabrics & Collars";
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const desc = "Browse ACD's full custom jersey catalogue — long sleeve, singlet, collared & standard cuts, plus 10 premium fabrics and 11 collar styles.";
    setMeta("description", desc);
    setMeta("og:title", "ACD Catalogue — Custom Jerseys", "property");
    setMeta("og:description", desc, "property");
    if (heroCollage[0]) setMeta("og:image", heroCollage[0], "property");
    return () => {
      document.title = prevTitle;
    };
  }, [heroCollage]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background collage */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-25">
          {heroCollage.map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover animate-fade-in"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-background/60" />

        <div className="relative container max-w-6xl py-20 md:py-32">
          <div className="space-y-6 max-w-3xl animate-slide-up">
            <h1 className="font-display text-foreground leading-[0.9] text-5xl md:text-7xl lg:text-8xl">
              Built to <span className="text-gradient">order.</span>
              <br />
              Made to <span className="text-gradient">last.</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              Every jersey on this page is fully customizable — your colours, your fabric, your collar, your name. Pick a category to start exploring.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#long-sleeve"
                className="inline-flex items-center gap-2 hero-gradient text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg"
              >
                Browse designs <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-display text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:border-accent hover:text-accent transition-all"
              >
                Request a quote
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border/50 mt-8">
              {[
                { n: `${categories.reduce((s, c) => s + c.totalCount, 0)}+`, l: "Designs" },
                { n: "10", l: "Fabrics" },
                { n: "11", l: "Collar styles" },
                { n: "100%", l: "Customizable" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl md:text-3xl text-foreground">{s.n}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Sticky chip nav ───── */}
      <ChipNav />

      {/* ───── Categories — bento grid ───── */}
      <section className="container max-w-6xl py-16 md:py-24">
        <SectionHeader
          index="01"
          eyebrow="The Range"
          title="Four cuts. Endless variations."
          subtitle="Each category is a starting point — not a limit. Tap any tile to see every design we've produced."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {categories.map((cat) => (
            <div key={cat.slug} id={cat.slug} className="scroll-mt-32">
              <CategoryTile category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* ───── Fabrics ───── */}
      <section id="fabrics" className="border-y border-border bg-card/30 scroll-mt-32">
        <div className="container max-w-6xl py-16 md:py-24">
          <SectionHeader
            index="02"
            eyebrow="Materials"
            title="Pick the fabric. Feel the difference."
            subtitle="From breathable mesh to premium lycra — choose what fits your sport, climate, and budget."
          />
          <SwatchGrid items={FABRICS} onOpen={() => setLightbox("fabric")} />
          <button
            onClick={() => setLightbox("fabric")}
            className="mt-6 inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-accent hover:gap-3 transition-all"
          >
            View full fabric reference <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ───── Collars ───── */}
      <section id="collars" className="scroll-mt-32">
        <div className="container max-w-6xl py-16 md:py-24">
          <SectionHeader
            index="03"
            eyebrow="Customization"
            title="Every neckline, dialled in."
            subtitle="Eleven collar styles — from clean roundneck to mandarin zip. Tap any to view the reference sheet."
          />
          <SwatchGrid items={COLLARS} onOpen={() => setLightbox("collar")} />
          <button
            onClick={() => setLightbox("collar")}
            className="mt-6 inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-accent hover:gap-3 transition-all"
          >
            View full collar reference <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ───── Telegram + Custom CTA band ───── */}
      <section className="container max-w-6xl pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-8 md:p-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="font-display text-xs uppercase tracking-[0.3em] text-accent">
                04 / Want More?
              </span>
              <h2 className="font-display text-3xl md:text-5xl text-foreground leading-[0.95]">
                More designs live on our Telegram.
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                Browse our latest drops on Telegram — or skip the scroll and tell us exactly what you need. We'll design it from scratch.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <a
                href="https://t.me/acdjersey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#229ED9] hover:bg-[#1a8abf] text-white font-display text-sm uppercase tracking-wider px-6 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                @acdjersey on Telegram
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors px-4 py-2"
              >
                Or request a custom design <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ───── Lightbox for fabric / collar reference ───── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 bg-card border border-border rounded-full p-2.5 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox === "fabric" ? fabricTypes : collarTypes}
            alt={lightbox === "fabric" ? "Fabric types reference" : "Collar types reference"}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Catalogue;
