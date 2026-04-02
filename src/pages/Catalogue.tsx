import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Shirt, X } from "lucide-react";

import ls1 from "@/assets/catalogue/longsleeve-1.png";
import ls2 from "@/assets/catalogue/longsleeve-2.png";
import ls3 from "@/assets/catalogue/longsleeve-3.png";
import ls4 from "@/assets/catalogue/longsleeve-4.png";
import ls5 from "@/assets/catalogue/longsleeve-5.png";

import sg1 from "@/assets/catalogue/singlet-1.png";
import sg2 from "@/assets/catalogue/singlet-2.png";
import sg3 from "@/assets/catalogue/singlet-3.png";
import sg4 from "@/assets/catalogue/singlet-4.png";

const categories = [
  {
    title: "Long Sleeve",
    description: "Premium long sleeve jerseys crafted for comfort, style, and performance.",
    images: [ls1, ls2, ls3, ls4, ls5],
  },
  {
    title: "Long Sleeve Muslimah",
    description: "Shariah-compliant long sleeve designs with full coverage, crafted for comfort and style.",
    images: [] as string[],
  },
  {
    title: "Singlet",
    description: "Lightweight and breathable singlet designs perfect for high-intensity activities.",
    images: [sg1, sg2, sg3, sg4],
  },
  {
    title: "Collared",
    description: "Professional collared jerseys ideal for corporate events and team uniforms.",
    images: [] as string[],
  },
  {
    title: "Standard Cutting",
    description: "Classic jersey cuts suitable for any occasion — versatile and comfortable.",
    images: [] as string[],
  },
];

const Catalogue = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-20 text-center space-y-4 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Browse</p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient">Our Catalogue</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore our range of premium sublimation apparel across different categories.
        </p>
      </section>

      {/* Categories */}
      <section className="pb-20 space-y-16">
        {categories.map((cat) => (
          <div key={cat.title} className="container max-w-6xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-display text-foreground">{cat.title}</h2>
              <p className="text-muted-foreground text-sm">{cat.description}</p>
            </div>

            {cat.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cat.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(src)}
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
                  >
                    <img
                      src={src}
                      alt={`${cat.title} design ${i + 1}`}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border bg-muted/10">
                <Shirt className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        ))}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-foreground bg-card/80 p-2 rounded-full border border-border"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Design preview"
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Catalogue;
