import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const reviews = [
  {
    name: "Raja Hafiz",
    rating: 5,
    time: "a month ago",
    text: "This is my second time ordering with Mr Munir ACD. Overall i would give feedback good service, easy to deal with, the material and detailing is good, the production is smooth and fast delivery. I would recommend this shop to my friend. 🤝🏼👍🏻",
  },
  {
    name: "Amir Rusyaidi",
    rating: 5,
    time: "a year ago",
    text: "Make our running jersey with acd. Love how they assist us to realising our ideas into design. Pretty fast on receiving our mockup. Production process is smooth. 100% recommend",
  },
  {
    name: "Syamil Hakim",
    rating: 5,
    time: "9 months ago",
    text: "Very satisfied with ACD Jersey! The service was excellent. Fast response, smooth communication, and they delivered exactly as promised. The jersey quality is top-notch, and the delivery was right on time as per our agreement. Highly recommended for anyone looking for reliable and quality jersey printing!",
  },
  {
    name: "Muhammad Kamarulzaman",
    rating: 5,
    time: "9 months ago",
    text: "Overall good design, I have made more than 3 bulk purchase. Just need to make sure the quality of stitching every-time.",
  },
  {
    name: "PNB Merdeka Ventures Sdn Berhad",
    rating: 5,
    time: "9 months ago",
    text: "Fast respond and quality baju terbaik. Able to deliver all request even urgent. really recommended. will repeat again in future",
  },
  {
    name: "Imrn Shrn",
    rating: 5,
    time: "7 months ago",
    text: "Solid manufacture!",
  },
  {
    name: "Capt Nas",
    rating: 5,
    time: "4 months ago",
    text: "Alhamdulillah, the clothes I ordered just arrived yesterday. Total of 26 pieces of clothes, round neck + singlet, finished in 7/8 days. Postage was fast. ACD Munir staff was very helpful in designing the clothes and choosing the fabric. Worth it and satisfied. Thank you Mr. Munir and ACD 🙋🏼‍♂️🫡",
  },
];

const Reviews = () => (
  <section className="py-20 surface-dark">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display text-gradient mb-3">What Our Customers Say</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-accent text-accent" />
            ))}
          </div>
          <span className="font-display text-lg text-foreground">4.9</span>
          <span className="text-muted-foreground text-sm">on Google Reviews</span>
        </div>
      </div>

      <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]} className="w-full max-w-5xl mx-auto">
        <CarouselContent>
          {reviews.map((review) => (
            <CarouselItem key={review.name} className="md:basis-1/2 lg:basis-1/3">
              <Card className="h-full bg-card border-border">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4">
                    "{review.text}"
                  </p>
                  <div className="border-t border-border pt-3 mt-auto">
                    <p className="font-display text-sm text-foreground">{review.name}</p>
                    <p className="text-muted-foreground text-xs">{review.time}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12 border-border text-foreground hover:bg-card" />
        <CarouselNext className="hidden md:flex -right-12 border-border text-foreground hover:bg-card" />
      </Carousel>
    </div>
  </section>
);

export default Reviews;
