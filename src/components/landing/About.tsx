import { Clock, MapPin, Phone } from "lucide-react";

const About = () => (
  <section className="py-20 bg-card">
    <div className="container">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-display text-gradient">WHO WE ARE</h2>
          <p className="text-muted-foreground leading-relaxed">
            ACD Jersey specialize in premium sublimation apparel, offering high-quality, customizable designs for sports and corporate wear. Trusted by major brands and organizations, we prioritize exceptional service and top-notch materials to deliver the best.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: MapPin, label: "Address", value: "U17, H, Aman Putri, 6-17-1A, Jalan Aman Damai, 40160 Shah Alam, Selangor" },
            { icon: Phone, label: "Phone", value: "019-339 6681" },
            { icon: Clock, label: "Hours", value: "10 AM – 6 PM (Mon–Sat)" },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 p-4 rounded-lg bg-card border border-border">
              <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm text-muted-foreground">{item.label}</p>
                <p className="text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
