import { Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import aliffImg from "@/assets/aliff-acd.jfif";
import imanImg from "@/assets/iman-acd.jfif";
import umarImg from "@/assets/umar-acd.jfif";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const agents = [
  {
    name: "UMAR ACD",
    phone: "019-339 6681",
    whatsapp: "https://wa.me/60193396681",
    role: "Sales Executive",
    bio: "With over 10 years of experience in sublimation apparel, Mr. Munir leads our team with dedication to quality and customer satisfaction.",
    image: umarImg,
  },
  {
    name: "ALIFF ACD",
    phone: "011-6844 8896",
    whatsapp: "https://wa.me/601168448896",
    role: "Sales Executive",
    bio: "Specializes in corporate bulk orders and custom team jerseys. Always ready to help bring your design ideas to life.",
    image: aliffImg,
  },
  {
    name: "IMAN ACD",
    phone: "018 255 2426",
    whatsapp: "https://wa.me/60182552426",
    role: "Sales Executive",
    bio: "Expert in sports apparel design and fabric selection. Dedicated to delivering the perfect fit and finish for every order.",
    image: imanImg,
  },
];

const designers = [
  {
    name: "FAIZ ACD",
    phone: "017-280 9232",
    whatsapp: "https://wa.me/60172809232",
    role: "Designer",
    bio: "Our creative mind behind every jersey design. Faiz transforms your ideas into stunning, print-ready artwork with precision and flair.",
    image: "",
  },
];

const Agents = () => (
  <div className="min-h-screen bg-background">
    <div className="surface-dark py-12 opacity-0 animate-fade-in" style={{ animationDuration: "0.6s", animationFillMode: "forwards" }}>
      <div className="container">
        <Button variant="outline" size="sm" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl md:text-5xl font-display text-gradient mb-3">Contact Our Team</h1>
        <p className="text-surface-dark-foreground/70 max-w-lg">
          Reach out to any of our agents directly via WhatsApp for enquiries, quotations, or orders.
        </p>
      </div>
    </div>

    <section className="py-16">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-display text-gradient mb-10 text-center opacity-0 animate-fade-in" style={{ animationDelay: "0.2s", animationDuration: "0.6s", animationFillMode: "forwards" }}>Our Sales Executive</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {agents.map((agent, i) => (
            <Card key={agent.name} className="bg-card border-border hover:border-primary/50 transition-colors opacity-0 animate-fade-in hover-scale" style={{ animationDelay: `${0.4 + i * 0.2}s`, animationDuration: "0.6s", animationFillMode: "forwards" }}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-5">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {agent.image ? (
                    <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-display text-foreground">
                      {agent.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl text-foreground">{agent.name}</h3>
                  <p className="text-primary text-sm font-medium">{agent.role}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{agent.bio}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{agent.phone}</span>
                </div>
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <a href={agent.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 border-t border-border">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-display text-gradient mb-10 text-center animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>Our Designer</h2>
        <div className="grid sm:grid-cols-1 gap-8 max-w-sm mx-auto">
          {designers.map((d) => (
            <Card key={d.name} className="bg-card border-border hover:border-primary/50 transition-colors animate-fade-in hover-scale" style={{ animationDelay: "0.75s", animationFillMode: "both" }}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-5">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {d.image ? (
                    <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-display text-foreground">
                      {d.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl text-foreground">{d.name}</h3>
                  <p className="text-primary text-sm font-medium">{d.role}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{d.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Agents;
