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

import { Shirt } from "lucide-react";

const categories = [
  {
    title: "Long Sleeve",
    description: "Premium long sleeve jerseys crafted for comfort, style, and performance.",
    images: [ls1, ls2, ls3, ls4, ls5],
    accent: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Singlet",
    description: "Lightweight and breathable singlet designs perfect for high-intensity activities.",
    images: [sg1, sg2, sg3, sg4],
    accent: "from-red-500/20 to-orange-500/20",
  },
  {
    title: "Collared",
    description: "Professional collared jerseys ideal for corporate events and team uniforms.",
    images: [cl1, cl2, cl3, cl4, cl5, cl6, cl7, cl8, cl9],
    accent: "from-emerald-500/20 to-teal-500/20",
  },
  {
    title: "Standard Cutting",
    description: "Classic jersey cuts suitable for any occasion — versatile and comfortable.",
    images: [] as string[],
    accent: "from-purple-500/20 to-pink-500/20",
  },
];

/* ─── Horizontal scroll gallery per category ─── */
const ScrollGallery = ({
  images,
  title,
  onImageClick,
}: {
  images: string[];
  title: string;
  onImageClick: (src: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll">
      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}

      {/* Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-card/90 backdrop-blur border border-border rounded-full p-2 opacity-0 group-hover/scroll:opacity-100 transition-opacity shadow-lg"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-card/90 backdrop-blur border border-border rounded-full p-2 opacity-0 group-hover/scroll:opacity-100 transition-opacity shadow-lg"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => onImageClick(src)}
            className="group flex-shrink-0 snap-start"
          >
            <div className="relative w-64 md:w-72 aspect-square rounded-xl overflow-hidden border border-border bg-card shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/40 hover:-translate-y-1">
              <img
                src={src}
                alt={`${title} design ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span className="text-xs font-display text-foreground bg-card/80 backdrop-blur px-3 py-1 rounded-full border border-border">
                  View Design
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Animated section that fades in on scroll ─── */
const AnimatedSection = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Catalogue = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const filtered = activeTab
    ? categories.filter((c) => c.title === activeTab)
    : categories;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-20 text-center space-y-4 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">
          Browse
        </p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient">
          Our Catalogue
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore our range of premium sublimation apparel across different
          categories.
        </p>
      </section>

      {/* Filter tabs */}
      <div className="container max-w-6xl mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab(null)}
            className={`px-5 py-2 rounded-full text-sm font-display uppercase tracking-wider transition-all duration-300 border ${
              activeTab === null
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-lg shadow-primary/20"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.title}
              onClick={() =>
                setActiveTab(activeTab === cat.title ? null : cat.title)
              }
              className={`px-5 py-2 rounded-full text-sm font-display uppercase tracking-wider transition-all duration-300 border ${
                activeTab === cat.title
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-lg shadow-primary/20"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {cat.title}
              {cat.images.length > 0 && (
                <span className="ml-2 text-xs opacity-60">
                  ({cat.images.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="pb-20 space-y-20">
        {filtered.map((cat, catIndex) => (
          <AnimatedSection key={cat.title}>
            <div className="space-y-6">
              {/* Category header with accent background */}
              <div
                className={`container max-w-6xl relative overflow-hidden rounded-2xl bg-gradient-to-r ${cat.accent} p-8 md:p-10 border border-border/50`}
              >
                <div className="relative z-10 flex items-end justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <span className="text-accent text-xs font-display uppercase tracking-[0.3em]">
                      {String(catIndex + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display text-foreground">
                      {cat.title}
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {cat.description}
                    </p>
                  </div>
                  {cat.images.length > 0 && (
                    <span className="text-muted-foreground text-sm font-display">
                      {cat.images.length} design
                      {cat.images.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="container max-w-6xl">
                {cat.images.length > 0 ? (
                  <ScrollGallery
                    images={cat.images}
                    title={cat.title}
                    onImageClick={setLightbox}
                  />
                ) : (
                  <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border bg-muted/10">
                    <div className="text-center space-y-2">
                      <Shirt className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                      <p className="text-muted-foreground/50 text-sm font-display">
                        Designs coming soon
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        ))}
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
