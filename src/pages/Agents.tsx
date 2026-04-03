import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import aliffImg from "@/assets/aliff-acd-new.png";
import faizImg from "@/assets/faiz-acd.jfif";
import imanImg from "@/assets/iman-acd.jfif";
import umarImg from "@/assets/umar-acd.jfif";
import jeedImg from "@/assets/jeed-acd.jfif";
import adamImg from "@/assets/adam-acd.png";
import hilmanImg from "@/assets/hilman-acd.png";
import harithImg from "@/assets/harith-acd.jpeg";
import didoImg from "@/assets/dido-acd.png";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import teamBg from "@/assets/team-bg.jpeg";

const agents = [
  {
    name: "UMAR ACD",
    phone: "019-339 6681",
    whatsapp: "https://wa.me/60193396681",
    role: "Sales Executive",
    bio: "With over 10 years of experience in sublimation apparel, I lead our team with dedication to uphold quality and customer satisfaction.",
    image: umarImg,
    imageClass: "object-[center_20%]",
  },
  {
    name: "ALYPH ACD",
    phone: "011-6844 8896",
    whatsapp: "https://wa.me/601168448896",
    role: "Sales Executive",
    bio: "Want custom jerseys but don’t want the headache? Just send your idea, I’ll handle the rest 🤝",
    image: aliffImg,
    imageClass: "object-[center_30%]",
  },
  {
    name: "MUNIR ACD",
    phone: "018-255 2426",
    whatsapp: "https://wa.me/60182552426",
    role: "Sales Executive",
    bio: "I help teams stand out with premium jerseys. Want yours to look different? Hit WhatsApp below 🤝",
    image: imanImg,
    imageClass: "object-[center_25%]",
  },
  {
    name: "JEED ACD",
    phone: "011-2436 2516",
    whatsapp: "https://wa.me/601124362516",
    role: "Sales Executive",
    bio: "Committed to providing a seamless ordering experience with prompt responses and personalized service for every client.",
    image: jeedImg,
    imageClass: "object-[center_30%]",
  },
  {
    name: "DIDO ACD",
    phone: "012-924 8639",
    whatsapp: "https://wa.me/60129248639",
    role: "Sales Executive",
    bio: "Passionate about connecting clients with the perfect apparel solutions, ensuring satisfaction from enquiry to delivery.",
    image: didoImg,
    imageClass: "scale-[1.3] object-[center_40%]", // zoom + move up
  },
  {
    name: "HILMAN ACD",
    phone: "011-5929 4190",
    whatsapp: "https://wa.me/601159294190",
    role: "Sales Executive / Web and Data Engineer",
    bio: "Ready to help you find the perfect apparel for your team, event, or brand 👕✨ Always here to make the process smooth from start to finish 🙌",
    image: hilmanImg,
    imageClass: "scale-[2.8] object-[center_110%]", // zoom + move up
  },
];

const designers = [
  {
    name: "FAIZ ACD",
    phone: "017-280 9232",
    whatsapp: "https://wa.me/60172809232",
    role: "Creative Director",
    bio: "Graphic Designer with 8+ years of experience, specializing in jersey, apparel, and print design. Known for delivering clean, elevated visuals with a strong attention to detail and premium finish.",
    image: faizImg,
    imageClass: "object-[center_40%]",
  },
  {
    name: "HARITH ACD",
    role: "Designer",
    bio: "Brings bold, creative concepts to life with an eye for detail and a passion for standout sportswear design.",
    image: harithImg,
    imageClass: "object-[center_25%]",
  },
  {
    name: "ADAM ACD",
    role: "Designer",
    bio: "Specializes in modern, dynamic jersey layouts that combine functionality with cutting-edge visual appeal.",
    image: adamImg,
    imageClass: "object-[center_40%]",
  },
];

const Agents = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <div className="relative py-20 animate-slide-up overflow-hidden">
      <div className="absolute inset-0">
        <img src={teamBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      <div className="container relative z-10">
        <h1 className="text-4xl md:text-5xl font-display text-gradient mb-3">Contact Our Team</h1>
        <p className="text-foreground/70 max-w-lg">
          Reach out to any of our agents directly via WhatsApp for enquiries, quotations, or orders.
        </p>
      </div>
    </div>

    <section className="py-16">
      <div className="container">
        <h2
          className="text-3xl md:text-4xl font-display text-gradient mb-10 text-center animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          Our Sales Executive
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {agents.map((agent, i) => (
            <Card
              key={agent.name}
              className="bg-card border-border hover:border-primary/50 transition-colors animate-slide-up hover-scale w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]"
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-5">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {agent.image ? (
                    <img
                      src={agent.image}
                      alt={agent.name}
                      className={`w-full h-full object-cover ${agent.imageClass || ""}`}
                    />
                  ) : (
                    <span className="text-4xl font-display text-foreground">{agent.name.charAt(0)}</span>
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
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
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
        <h2
          className="text-3xl md:text-4xl font-display text-gradient mb-10 text-center animate-slide-up"
          style={{ animationDelay: "0.75s" }}
        >
          Our Designers
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {designers.map((d, i) => (
            <Card
              key={d.name}
              className="bg-card border-border hover:border-primary/50 transition-colors animate-slide-up hover-scale"
              style={{ animationDelay: `${0.9 + i * 0.15}s` }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-5">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {d.image ? (
                    <img src={d.image} alt={d.name} className={`w-full h-full object-cover ${d.imageClass || ""}`} />
                  ) : (
                    <span className="text-4xl font-display text-foreground">{d.name.charAt(0)}</span>
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
