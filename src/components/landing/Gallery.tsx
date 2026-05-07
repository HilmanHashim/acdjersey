import { useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

// Pull every catalogue image across all four categories.
const collaredImgs = import.meta.glob("@/assets/catalogue/collared/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const longsleeveImgs = import.meta.glob("@/assets/catalogue/longsleeve/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const singletImgs = import.meta.glob("@/assets/catalogue/singlet/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const standardImgs = import.meta.glob("@/assets/catalogue/standard/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const categories = [
  { label: "Collared", images: Object.values(collaredImgs) },
  { label: "Long Sleeve", images: Object.values(longsleeveImgs) },
  { label: "Singlet", images: Object.values(singletImgs) },
  { label: "Standard", images: Object.values(standardImgs) },
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
  const { ref, inView } = useInView<HTMLDivElement>();

  // Build all projects, shuffled with their category label.
  const projects = useMemo(() => {
    const all = categories.flatMap((c) => c.images.map((src) => ({ src, label: c.label })));
    return shuffle(all);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * dir * 2, behavior: "smooth" });
  };

  return (
    <section className="py-24 md:py-32 bg-background">
      <div ref={ref} className="container space-y-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="space-y-3">
            <p className={`font-display text-accent uppercase tracking-[0.35em] text-xs reveal ${inView ? "in-view" : ""}`}>Featured</p>
            <h2 className={`font-display uppercase text-foreground leading-[0.95] text-5xl md:text-7xl reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.1s" }}>
              Recent <span className="text-gradient">Projects</span>
            </h2>
          </div>
          <div className={`hidden md:flex items-center gap-2 reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="h-12 w-12 rounded-full border border-border bg-background hover:bg-foreground hover:text-background transition flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="h-12 w-12 rounded-full border border-border bg-background hover:bg-foreground hover:text-background transition flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`mt-2 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-[max(1rem,calc((100vw-1280px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden reveal ${inView ? "in-view" : ""}`}
        style={{ animationDelay: "0.3s" }}
      >
        {projects.map((p, i) => (
          <div
            key={i}
            data-card
            className="snap-start shrink-0 w-[78vw] sm:w-[55vw] md:w-[38vw] lg:w-[28vw] xl:w-[22vw]"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-card group">
              <img
                src={p.src}
                alt={`${p.label} project ${i + 1}`}
                loading={i < 4 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 font-display uppercase tracking-[0.25em] text-[10px] text-white/80 bg-black/40 backdrop-blur px-2 py-1 rounded-full">
                0{(i % 9) + 1}
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <p className="font-display uppercase tracking-[0.2em] text-sm text-foreground">{p.label}</p>
              <p className="font-body text-xs text-muted-foreground">Custom Kit</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
