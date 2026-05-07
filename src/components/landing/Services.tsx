import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/use-in-view";
import imgJersey from "@/assets/catalogue/standard/img-001.jpg";
import imgDesign from "@/assets/design-services.jpg";
import imgCorporate from "@/assets/catalogue/longsleeve/img-001.jpg";
import imgSports from "@/assets/sports-team.jpg";

const services = [
  { title: "Custom Jerseys", desc: "Full sublimation kits with your designs, logos and colours.", to: "/catalogue", image: imgJersey },
  { title: "Design Services", desc: "Professional in-house design team to bring your vision to life.", to: "/enquiry", image: imgDesign },
  { title: "Corporate Wear", desc: "Branded apparel for teams, events and companies.", to: "/enquiry", image: imgCorporate },
  { title: "Sports Teams", desc: "Complete kits for football, futsal, badminton and more.", to: "/catalogue", image: imgSports },
];

const Services = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden border-t border-border/40">
      <div aria-hidden className="pointer-events-none absolute -bottom-10 -right-10 font-display uppercase text-[16vw] leading-none text-foreground/[0.03] select-none">LINEUP</div>
      <div ref={ref} className="container relative space-y-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 font-display uppercase tracking-[0.3em] text-[10px] -rotate-1 reveal ${inView ? "in-view" : ""}`}>
              ✦ What We Do / 01
            </div>
            <h2
              className={`font-display uppercase text-foreground leading-[0.9] text-5xl md:text-7xl reveal ${inView ? "in-view" : ""}`}
              style={{ animationDelay: "0.1s" }}
            >
              The <span className="text-gradient">Lineup</span>
            </h2>
          </div>
          <Link
            to="/catalogue"
            className={`group inline-flex items-center gap-2 font-display uppercase tracking-[0.25em] text-sm text-foreground border-b border-foreground/30 hover:border-foreground pb-1 reveal ${inView ? "in-view" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            View All
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <Link
              key={s.title}
              to={s.to}
              className={`group relative aspect-[3/4] overflow-hidden bg-card border border-border/60 hover:border-accent transition-all duration-500 reveal ${inView ? "in-view" : ""}`}
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
              <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                <span className="font-display uppercase tracking-[0.25em] text-xs text-white/80">
                  0{i + 1}
                </span>
                <div className="space-y-3">
                  <h3 className="font-display uppercase text-2xl md:text-3xl text-white leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">{s.desc}</p>
                  <span className="inline-flex items-center gap-2 text-white font-display uppercase tracking-[0.25em] text-xs pt-2">
                    Explore
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
