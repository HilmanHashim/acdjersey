import heroImage from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Phone, MapPin, Send } from "lucide-react";

const Hero = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden surface-dark">
    <div className="absolute inset-0">
      <img
        src={heroImage}
        alt="Premium sublimation jerseys by ACD Jersey HQ"
        width={1920}
        height={1080}
        className="w-full h-full object-cover opacity-90 saturate-[1.2] contrast-[1.05] animate-slow-zoom"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/80 to-transparent" />
    </div>
    <div className="container relative z-10 py-20">
      <div className="max-w-2xl space-y-6">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Premium Sublimation Apparel
        </p>
        <h1 className="relative text-5xl md:text-7xl font-display leading-[0.95] opacity-0 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <span className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full animate-pulse-glow -z-10" aria-hidden />
          <span className="text-surface-dark-foreground">ACD</span>{" "}
          <span className="text-gradient">Jersey</span>
        </h1>
        <p className="text-lg text-surface-dark-foreground/70 font-body max-w-lg opacity-0 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          High-quality, customizable designs for sports and corporate wear. Trusted by major brands and organizations across Malaysia.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <Button variant="hero" size="lg" asChild className="group transition-transform hover:scale-105">
            <Link to="/enquiry">
              <Send className="mr-2 h-5 w-5 icon-nudge" /> Get A Quote
            </Link>
          </Button>
          <Button size="lg" asChild className="group bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-display uppercase tracking-wider transition-transform hover:scale-105">
            <Link to="/agents">
              <Phone className="mr-2 h-5 w-5 icon-nudge" /> Contact Us
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 pt-4 text-surface-dark-foreground/60 text-sm opacity-0 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <MapPin className="h-4 w-4" />
          <span>Aman Putri, Shah Alam, Selangor</span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
