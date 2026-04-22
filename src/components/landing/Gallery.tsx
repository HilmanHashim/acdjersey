import { useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

// Pull every catalogue image across all four categories.
const collaredImgs = import.meta.glob("@/assets/catalogue/collared/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const longsleeveImgs = import.meta.glob("@/assets/catalogue/longsleeve/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const singletImgs = import.meta.glob("@/assets/catalogue/singlet/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const standardImgs = import.meta.glob("@/assets/catalogue/standard/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const allImages = [
  ...Object.values(collaredImgs),
  ...Object.values(longsleeveImgs),
  ...Object.values(singletImgs),
  ...Object.values(standardImgs),
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Gallery = () => {
  const images = useMemo(() => shuffle(allImages), []);
  const [current, setCurrent] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next, images.length]);

  const showDots = images.length > 1 && images.length <= 12;

  return (
    <section className="py-20 bg-card">
      <div ref={ref} className="container space-y-10">
        <div className="text-center space-y-3">
          <p className={`text-accent uppercase tracking-[0.25em] text-sm font-display reveal ${inView ? "in-view" : ""}`}>Our Work</p>
          <h2 className={`text-3xl md:text-5xl font-display text-foreground reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.15s" }}>
            Recent Projects
          </h2>
        </div>

        <div className={`relative group mx-auto w-full max-w-[80vh] reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.3s" }}>
          {/* Main image */}
          <div className="relative h-[80vh] w-full overflow-hidden">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Project ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-out ${
                  i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border hover:scale-110"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>

          {/* Dots (only when image count is small enough) */}
          {showDots && (
            <div className="flex justify-center gap-2 mt-6">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    i === current ? "w-8 bg-accent" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
