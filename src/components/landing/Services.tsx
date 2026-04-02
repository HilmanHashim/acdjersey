import { Shirt, Palette, Users, Trophy } from "lucide-react";

const services = [
  { icon: Shirt, title: "Custom Jerseys", desc: "Full sublimation jerseys with your designs, logos, and colors." },
  { icon: Palette, title: "Design Service", desc: "Professional in-house design team to bring your vision to life." },
  { icon: Users, title: "Corporate Wear", desc: "Branded corporate apparel for teams, events, and companies." },
  { icon: Trophy, title: "Sports Teams", desc: "Complete team kits for football, futsal, badminton, and more." },
];

const Services = () => (
  <section className="py-20 surface-dark">
    <div className="container">
      <h2 className="text-4xl font-display text-center mb-12">
        <span className="text-foreground">Our </span>
        <span className="text-gradient">Services</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s) => (
          <div key={s.title} className="group p-6 rounded-xl bg-surface-dark-foreground/5 border border-surface-dark-foreground/10 hover:border-primary/50 transition-colors">
            <s.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-lg text-surface-dark-foreground mb-2">{s.title}</h3>
            <p className="text-surface-dark-foreground/60 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;
