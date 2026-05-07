import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useInView } from "@/hooks/use-in-view";

import client1 from "@/assets/clients/client-1.jpeg";
import client2 from "@/assets/clients/client-2.jpeg";
import client3 from "@/assets/clients/client-3.jpeg";
import client4 from "@/assets/clients/client-4.jpeg";
import client5 from "@/assets/clients/client-5.jpeg";
import client6 from "@/assets/clients/client-6.jpeg";
import client7 from "@/assets/clients/client-7.jpeg";
import client8 from "@/assets/clients/client-8.jpeg";
import client9 from "@/assets/clients/client-9.jpeg";
import client10 from "@/assets/clients/client-10.jpeg";
const clientImages = [
  { src: client1, alt: "Running team in yellow sublimation jerseys" },
  { src: client2, alt: "Team Treximo in custom sublimation singlets" },
  { src: client3, alt: "Kudos Club running team in blue sublimation jerseys" },
  { src: client4, alt: "Kota Bharu Half Marathon team in custom jerseys" },
  { src: client5, alt: "Running team in black and red sublimation jerseys" },
  { src: client6, alt: "Grill Haven custom sublimation t-shirts" },
  { src: client7, alt: "Bintulu Marathon team in purple sublimation jerseys" },
  { src: client8, alt: "Kelantan Half Marathon team in pink sublimation jerseys" },
  { src: client9, alt: "Football team in red sublimation jerseys" },
  { src: client10, alt: "Bob Running Club sublimation jerseys" },
];

const Clients = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden border-t border-border/40">
      <div ref={ref} className="container relative">
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1 font-display uppercase tracking-[0.3em] text-[10px] rotate-[2deg]">★ Trusted By Many</div>
            <h2 className={`font-display uppercase text-foreground leading-[0.9] text-5xl md:text-7xl reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.1s" }}>
              Worn By <span className="text-gradient">Champions</span>
            </h2>
          </div>
          <span className="font-display uppercase tracking-[0.3em] text-[10px] text-muted-foreground"></span>
        </div>

        <div className={`max-w-5xl mx-auto reveal ${inView ? "in-view" : ""}`} style={{ animationDelay: "0.3s" }}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {clientImages.map((image, index) => (
                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="overflow-hidden rounded-lg border border-border hover:border-primary/60 transition-all duration-500 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.4)]">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full aspect-[4/3] object-cover hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12" />
            <CarouselNext className="hidden sm:flex -right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Clients;
