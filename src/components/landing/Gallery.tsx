import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

import img1 from "@/assets/carousel-1.jpg";
import img2 from "@/assets/carousel-2.jpg";
import img3 from "@/assets/carousel-3.jpg";
import img4 from "@/assets/carousel-4.jpg";
import img5 from "@/assets/carousel-5.jpg";
import img6 from "@/assets/carousel-6.jpg";
import img7 from "@/assets/carousel-7.jpg";
import img8 from "@/assets/carousel-8.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7, img8];

const Gallery = () => {
  const [current, setCurrent] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), []);

  useEffect(() => {
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="py-20 bg-card">
      <div ref={ref} className="container space-y-10">
        <div className="text-center space-y-3">
          <p className={`text-accent uppercase tracking-[0.25em] text-sm font-display reveal ${inView ? "in-view" : ""}`}>Our Work</p>
          <h2 className={`text-3xl md:text-5xl font-display text-foreground reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.15s" }}>
            Recent Projects
          </h2>
        </div>

        <div className={`relative group my-0 py-0 reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.3s" }}>
          {/* Main image */}
          <div className="relative h-[80vh] w-full overflow-hidden rounded-xl border border-border shadow-2xl">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Project ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-out ${
                  i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-border hover:scale-110"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>

          {/* Dots */}
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
        </div>
      </div>
    </section>
  );
};

export default Gallery;
