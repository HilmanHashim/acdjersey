import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import ls1 from "@/assets/catalogue/longsleeve-1.png";
import ls2 from "@/assets/catalogue/longsleeve-2.png";
import ls3 from "@/assets/catalogue/longsleeve-3.png";
import ls4 from "@/assets/catalogue/longsleeve-4.png";
import ls5 from "@/assets/catalogue/longsleeve-5.png";

import sg1 from "@/assets/catalogue/singlet-1.png";
import sg2 from "@/assets/catalogue/singlet-2.png";
import sg3 from "@/assets/catalogue/singlet-3.png";
import sg4 from "@/assets/catalogue/singlet-4.png";

import cl1 from "@/assets/catalogue/collared-1.png";
import cl2 from "@/assets/catalogue/collared-2.png";
import cl3 from "@/assets/catalogue/collared-3.png";
import cl4 from "@/assets/catalogue/collared-4.png";
import cl5 from "@/assets/catalogue/collared-5.png";
import cl6 from "@/assets/catalogue/collared-6.png";
import cl7 from "@/assets/catalogue/collared-7.png";
import cl8 from "@/assets/catalogue/collared-8.png";
import cl9 from "@/assets/catalogue/collared-9.png";

import st1 from "@/assets/catalogue/standard-1.png";
import st2 from "@/assets/catalogue/standard-2.png";
import st3 from "@/assets/catalogue/standard-3.png";
import st4 from "@/assets/catalogue/standard-4.png";
import st5 from "@/assets/catalogue/standard-5.png";
import st6 from "@/assets/catalogue/standard-6.png";
import st7 from "@/assets/catalogue/standard-7.png";

import fabricTypes from "@/assets/catalogue/fabric-types.png";
import collarTypes from "@/assets/catalogue/collar-types.png";

const categories = [
  {
    title: "Long Sleeve",
    description: "Premium long sleeve jerseys for comfort & performance.",
    images: [ls1, ls2, ls3, ls4, ls5],
  },
  {
    title: "Singlet",
    description: "Lightweight singlets for high-intensity activities.",
    images: [sg1, sg2, sg3, sg4],
  },
  {
    title: "Collared",
    description: "Professional collared jerseys for events & teams.",
    images: [cl1, cl2, cl3, cl4, cl5, cl6, cl7, cl8, cl9],
  },
  {
    title: "Standard Cutting",
    description: "Classic versatile jersey cuts for any occasion.",
    images: [st1, st2, st3, st4, st5, st6, st7],
  },
];

/* ─── Category card with built-in horizontal carousel ─── */
const CategoryCard = ({
  category,
  onImageClick,
}: {
  category: (typeof categories)[0];
  onImageClick: (src: string) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const total = category.images.length;

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1));
    setCurrent(clamped);
    const el = scrollRef.current;
    if (el) {
      const child = el.children[clamped] as HTMLElement;
      if (child) {
        el.scrollTo({ left: child.offsetLeft - 8, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-500">
      {/* Image carousel area */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory p-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={() => {
            const el = scrollRef.current;
            if (!el) return;
            const scrollLeft = el.scrollLeft;
            const childWidth = (el.children[0] as HTMLElement)?.offsetWidth || 1;
            setCurrent(Math.round(scrollLeft / (childWidth + 8)));
          }}
        >
          {category.images.map((src, i) => (
            <button
              key={i}
              onClick={() => onImageClick(src)}
              className="flex-shrink-0 snap-start w-full aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={src}
                alt={`${category.title} ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              onClick={() => scrollTo(current - 1)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur border border-border rounded-full p-1.5 transition-opacity shadow-md ${
                current > 0 ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => scrollTo(current + 1)}
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
                onClick={() => scrollTo(i)}
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
            {total} sample{total !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {category.description}
        </p>
      </div>
    </div>
  );
};

const Catalogue = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);

  // 2x2 grid: left column = Long Sleeve + Singlet, right = Collared + Standard
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
              <CategoryCard
                key={cat.title}
                category={cat}
                onImageClick={setLightbox}
              />
            ))}
          </div>
          <div className="space-y-6">
            {rightCol.map((cat) => (
              <CategoryCard
                key={cat.title}
                category={cat}
                onImageClick={setLightbox}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-foreground bg-card/80 p-2 rounded-full border border-border hover:bg-card transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Design preview"
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Catalogue;
