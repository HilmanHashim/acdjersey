import { Shirt, Palette, Users, Trophy } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const services = [
  { icon: Shirt, title: "Custom Jerseys", desc: "Full sublimation jerseys with your designs, logos, and colors." },
  { icon: Palette, title: "Design Services", desc: "Professional in-house design team to bring your vision to life." },
  { icon: Users, title: "Corporate Wear", desc: "Branded corporate apparel for teams, events, and companies." },
  { icon: Trophy, title: "Sports Teams", desc: "Complete team kits for football, futsal, badminton, and more." },
];

const Services = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="py-20 bg-background">
      <div ref={ref} className="container">
        <h2 className={`text-4xl font-display text-center mb-12 reveal ${inView ? "in-view" : ""}`}>
          <span className="text-foreground">Our </span>
          <span className="text-gradient">Services</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`group p-6 rounded-xl bg-card border border-border hover:border-primary/50 card-lift reveal ${inView ? "in-view" : ""}`}
              style={{ animationDelay: `${0.15 + i * 0.1}s` }}
            >
              <s.icon className="h-10 w-10 text-accent mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              <h3 className="font-display text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
