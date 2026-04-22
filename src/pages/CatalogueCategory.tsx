import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft, X } from "lucide-react";

// Eager glob — Vite will bundle every image and return a URL map keyed by path.
const collaredImgs = import.meta.glob("@/assets/catalogue/collared/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const longsleeveImgs = import.meta.glob("@/assets/catalogue/longsleeve/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const singletImgs = import.meta.glob("@/assets/catalogue/singlet/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const standardImgs = import.meta.glob("@/assets/catalogue/standard/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const toSorted = (m: Record<string, string>) =>
  Object.entries(m)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

const CATEGORIES: Record<string, { title: string; description: string; images: string[] }> = {
  "long-sleeve": {
    title: "Long Sleeve / Muslimah",
    description: "Premium long sleeve jerseys for comfort & performance.",
    images: toSorted(longsleeveImgs),
  },
  singlet: {
    title: "Singlet",
    description: "Lightweight singlets for high-intensity activities.",
    images: toSorted(singletImgs),
  },
  collared: {
    title: "Collared",
    description: "Professional collared jerseys for events & teams.",
    images: toSorted(collaredImgs),
  },
  "standard-cutting": {
    title: "Standard Cutting",
    description: "Classic versatile jersey cuts for any occasion.",
    images: toSorted(standardImgs),
  },
};

const CatalogueCategory = () => {
  const { slug = "" } = useParams();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const category = CATEGORIES[slug];
  if (!category) return <Navigate to="/catalogue" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container max-w-6xl pt-8 pb-4">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-accent hover:bg-accent hover:text-accent-foreground text-foreground font-display text-sm shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Catalogue
        </Link>
      </section>

      <section className="container max-w-6xl pt-2 pb-10 text-center space-y-3 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Category</p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient title-glow inline-block">{category.title}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">{category.description}</p>
        <p className="text-xs text-muted-foreground font-display">
          {category.images.length} design{category.images.length !== 1 ? "s" : ""}
        </p>
      </section>

      <section className="container max-w-6xl pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {category.images.map((src, i) => (
            <button
              key={src}
              onClick={() => setLightbox(src)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-all duration-500 bg-card"
            >
              <img
                src={src}
                alt={`${category.title} design ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      </section>

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

export default CatalogueCategory;
