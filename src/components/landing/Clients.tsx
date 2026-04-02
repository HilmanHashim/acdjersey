import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import client1 from "@/assets/clients/client-1.jpeg";
import client2 from "@/assets/clients/client-2.jpeg";
import client3 from "@/assets/clients/client-3.jpeg";
import client4 from "@/assets/clients/client-4.jpeg";
import client5 from "@/assets/clients/client-5.jpeg";
import client6 from "@/assets/clients/client-6.jpeg";
import client7 from "@/assets/clients/client-7.jpeg";
import client8 from "@/assets/clients/client-8.jpeg";
import client9 from "@/assets/clients/client-9.jpeg";

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
];

const Clients = () => (
  <section className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-12 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm mb-3">
          Trusted By Many
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-foreground">
          Our <span className="text-gradient">Clients</span>
        </h2>
      </div>

      <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.15s" }}>
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
                <div className="overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
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

export default Clients;
