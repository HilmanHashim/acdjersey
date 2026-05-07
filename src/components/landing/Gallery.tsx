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

type CarouselProps = {
  images: string[];
  intervalMs: number;
  startOffset?: number;
};

const Carousel = ({ images, intervalMs, startOffset = 0 }: CarouselProps) => {
  const [current, setCurrent] = useState(startOffset % Math.max(images.length, 1));

  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [next, images.length, intervalMs]);

  return (
    <div className="relative group w-full">
      <div className="relative aspect-[3/4] md:h-[70vh] md:aspect-auto w-full overflow-hidden">
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

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border hover:scale-110"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
    </div>
  );
};

const Gallery = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  const { left, right } = useMemo(() => {
    const shuffled = shuffle(allImages);
    const half = Math.ceil(shuffled.length / 2);
    return { left: shuffled.slice(0, half), right: shuffled.slice(half) };
  }, []);

  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden border-t border-border/40">
      <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 font-display uppercase text-[16vw] leading-none text-foreground/[0.03] select-none">DROP 03</div>
      <div ref={ref} className="container relative space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1 font-display uppercase tracking-[0.3em] text-[10px]">◆ Featured / 03</div>
          <h2 className={`font-display uppercase text-foreground leading-[0.9] text-5xl md:text-7xl reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.1s" }}>
            Recent <span className="text-gradient">Projects</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className={`reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.3s" }}>
            <Carousel images={left} intervalMs={3000} />
          </div>
          <div className={`reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.45s" }}>
            <Carousel images={right} intervalMs={3500} startOffset={1} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
