import { Clock, MapPin, Phone } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const About = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden">
      <div ref={ref} className="container relative">
        <div className="inline-flex items-center gap-2 mb-6 bg-accent text-accent-foreground px-3 py-1 font-display uppercase tracking-[0.3em] text-[10px] rotate-[-2deg]">● The Studio</div>
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-7 space-y-6">
            <h2
              className={`font-display uppercase text-foreground leading-[0.95] text-5xl md:text-7xl reveal ${inView ? "in-view" : ""}`}
              style={{ animationDelay: "0.1s" }}
            >
              Built In <span className="text-gradient">Shah Alam.</span>
              <br /> Worn Everywhere.
            </h2>
            <p
              className={`text-muted-foreground text-lg leading-relaxed max-w-xl reveal ${inView ? "in-view" : ""}`}
              style={{ animationDelay: "0.2s" }}
            >
              ACD Jersey crafts premium sublimation apparel — high-performance kits and corporate wear engineered with conviction. Trusted by major brands and clubs across Malaysia.
            </p>
          </div>

          <div className="md:col-span-5 space-y-3">
            {[
              { icon: MapPin, label: "Visit", value: "U17, H, Aman Putri, 6-17-1A, Jalan Aman Damai, Aman Putri, 40160 Shah Alam, Selangor" },
              { icon: Phone, label: "Call", value: "019-339 6681" },
              { icon: Clock, label: "Hours", value: "10 AM – 6 PM (Mon–Sat)" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`flex gap-4 p-5 border-b border-border/60 reveal ${inView ? "in-view" : ""}`}
                style={{ animationDelay: `${0.25 + i * 0.1}s` }}
              >
                <item.icon className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">{item.label}</p>
                  <p className="text-foreground mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
