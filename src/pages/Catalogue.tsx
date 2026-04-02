import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt } from "lucide-react";

const categories = [
  {
    title: "Long Sleeve Muslimah",
    description: "Shariah-compliant long sleeve designs with full coverage, crafted for comfort and style.",
    images: [] as string[],
  },
  {
    title: "Singlet",
    description: "Lightweight and breathable singlet designs perfect for high-intensity activities.",
    images: [] as string[],
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

const Catalogue = () => (
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
    <section className="pb-20">
      <div className="container grid sm:grid-cols-2 gap-8 max-w-5xl">
        {categories.map((cat) => (
          <Card key={cat.title} className="bg-card border-border overflow-hidden group hover:border-primary/40 transition-colors">
            <CardContent className="p-0">
              {/* Placeholder when no images yet */}
              <div className="h-52 bg-muted/30 flex items-center justify-center">
                <Shirt className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
              </div>
              <div className="p-6 space-y-2">
                <h2 className="text-xl font-display text-foreground">{cat.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{cat.description}</p>
                <p className="text-xs text-accent font-display uppercase tracking-wider pt-2">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <Footer />
  </div>
);

export default Catalogue;
