import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Send } from "lucide-react";
import slide1 from "@/assets/hero-team.jpg";
import slide2 from "@/assets/hero-track-motion.jpg";
import slide3 from "@/assets/hero-jersey-flatlay.jpg";
import slide4 from "@/assets/hero-slide-3.jpg";
import slide5 from "@/assets/hero-slide-2.jpg";
import slide6 from "@/assets/hero-slide-1.jpg";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
};

const slides: Slide[] = [
  {
    image: slide1,
    eyebrow: "Built For The Game",
    title: "OWN THE",
    highlight: "FIELD",
    subtitle: "Tournament-ready sublimation jerseys engineered in Malaysia.",
    primary: { label: "Get A Quote", to: "/enquiry" },
    secondary: { label: "View Catalogue", to: "/catalogue" },
  },
  {
    image: slide2,
    eyebrow: "Built To Move",
    title: "RUN WITH",
    highlight: "PURPOSE",
    subtitle: "Engineered fabrics that move as fast as you do.",
    primary: { label: "Start Your Order", to: "/enquiry" },
    secondary: { label: "View Catalogue", to: "/catalogue" },
  },
  {
    image: slide3,
    eyebrow: "Crafted In Detail",
    title: "EVERY",
    highlight: "STITCH",
    subtitle: "Premium sublimation finishes built to last beyond the final whistle.",
    primary: { label: "Get A Quote", to: "/enquiry" },
    secondary: { label: "Browse Designs", to: "/catalogue" },
  },
  {
    image: slide4,
    eyebrow: "Custom Team Apparel",
    title: "DESIGNED",
    highlight: "FOR YOU",
    subtitle: "Your colours. Your crest. Your identity — stitched into every thread.",
    primary: { label: "Customize Now", to: "/enquiry" },
    secondary: { label: "Browse Designs", to: "/catalogue" },
  },
  {
    image: slide5,
    eyebrow: "Trusted By Champions",
    title: "WORN BY",
    highlight: "THE BEST",
    subtitle: "From corporate teams to national tournaments — we deliver.",
    primary: { label: "Start Your Order", to: "/enquiry" },
    secondary: { label: "Meet The Team", to: "/about" },
  },
  {
    image: slide6,
    eyebrow: "Trusted By Champions",
    title: "WORN BY",
    highlight: "THE BEST",
    subtitle: "From corporate teams to national tournaments — we deliver.",
    primary: { label: "Start Your Order", to: "/enquiry" },
    secondary: { label: "Meet The Team", to: "/about" },
  },
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden surface-dark">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover scale-105"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        ))}

        <div className="container relative z-10 h-full flex items-end pb-24 md:pb-28">
          <div className="max-w-3xl space-y-5">
            <h1
              className="font-display text-white leading-[0.9] text-6xl md:text-8xl lg:text-9xl uppercase opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
            >
              DARE TO
              <br />
              <span className="text-gradient">DREAM</span>
            </h1>
            <p
              className="text-base md:text-lg text-white/80 font-body max-w-xl opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              Premium sublimation jerseys engineered in Malaysia for teams that play to win.
            </p>
            <div
              className="flex flex-wrap gap-3 pt-3 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-black hover:bg-white/90 font-display uppercase tracking-wider px-7 transition-transform hover:scale-105"
              >
                <Link to="/enquiry">
                  <Send className="mr-2 h-4 w-4" /> Get A Quote
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white hover:text-black font-display uppercase tracking-wider px-7 transition-transform hover:scale-105"
              >
                <Link to="/catalogue">
                  View Catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Marquee strip — Nike-style: black background, crisp white type */}
      <div className="bg-black text-white overflow-hidden border-y border-white/10">
        <div className="flex w-max py-3 animate-marquee will-change-transform">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
              {[
                "Custom Sublimation Jerseys",
                "Fast Turnaround",
                "Free Design Consultation",
                "Trusted Across Malaysia",
                "Bulk Orders Welcome",
                "Premium Performance Fabric",
              ].map((t, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="font-display uppercase tracking-[0.3em] text-sm px-8 flex items-center gap-8 whitespace-nowrap"
                >
                  {t}
                  <span className="text-accent">★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero;
