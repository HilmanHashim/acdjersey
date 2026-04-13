import heroImage from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Phone, MapPin, Send } from "lucide-react";

const Hero = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden surface-dark">
    <div className="absolute inset-0">
      <img src={heroImage} alt="Premium sublimation jerseys by ACD Jersey HQ" width={1920} height={1080} className="w-full h-full object-cover opacity-90 saturate-[1.2] contrast-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/80 to-transparent" />
    </div>
    <div className="container relative z-10 py-20">
      <div className="max-w-2xl space-y-6 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Premium Sublimation Apparel</p>
        <h1 className="text-5xl md:text-7xl font-display leading-[0.95]">
          <span className="text-surface-dark-foreground">ACD</span>{" "}
          <span className="text-gradient">Jersey</span>
        </h1>
        <p className="text-lg text-surface-dark-foreground/70 font-body max-w-lg">
          High-quality, customizable designs for sports and corporate wear. Trusted by major brands and organizations across Malaysia.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="hero" size="lg" asChild>
            <Link to="/enquiry">
              <Send className="mr-2 h-5 w-5" /> Get A Quote
            </Link>
          </Button>
          <Button size="lg" asChild className="bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-display uppercase tracking-wider">
            <Link to="/agents">
              <Phone className="mr-2 h-5 w-5" /> Contact Us
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 pt-4 text-surface-dark-foreground/60 text-sm">
          <MapPin className="h-4 w-4" />
          <span>Aman Putri, Shah Alam, Selangor</span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
