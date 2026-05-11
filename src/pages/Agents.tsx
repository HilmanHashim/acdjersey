import { Phone, MessageCircle, MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";
import aliffImg from "@/assets/aliff-acd-new.png";
import faizImg from "@/assets/faiz-acd.jfif";
import imanImg from "@/assets/iman-acd.jfif";
import umarImg from "@/assets/umar-acd.jfif";
import jeedImg from "@/assets/jeed-acd.jfif";
import adamImg from "@/assets/adam-acd.png";
import hilmanImg from "@/assets/hilman-acd.png";
import harithImg from "@/assets/harith-acd.jpeg";
import didoImg from "@/assets/dido-acd.png";
import Navbar from "@/components/Navbar";
import teamBg from "@/assets/team-bg.jpeg";

const agents = [
  {
    name: "UMAR ACD",
    phone: "019-339 6681",
    whatsapp: "https://wa.me/60193396681",
    role: "Sales Executive",
    bio: "With over 4 years of experience in sublimation apparel, I lead our team with dedication to uphold quality and customer satisfaction.",
    image: umarImg,
    imageClass: "object-[center_20%]",
  },
  {
    name: "ALYPH ACD",
    phone: "011-6844 8896",
    whatsapp: "https://wa.me/601168448896",
    role: "Sales Executive",
    bio: "Want custom jerseys but don't want the headache? Just send your idea, I'll handle the rest 🤝",
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
    imageClass: "scale-[1.8] object-[center_55%]",
  },
  {
    name: "HILMAN ACD",
    phone: "011-5929 4190",
    whatsapp: "https://wa.me/601159294190",
    role: "Sales Executive / Web & Data Engineer",
    bio: "Ready to help you find the perfect apparel for your team, event, or brand 👕 Always here to make the process smooth from start to finish 🙌",
    image: hilmanImg,
    imageClass: "scale-[2.8] object-[center_110%]",
  },
];

const designers = [
  {
    name: "FAIZ ACD",
    phone: "017-280 9232",
    whatsapp: "https://wa.me/60172809232",
    role: "Creative Director",
    bio: "Graphic Designer with 8+ years of experience, specializing in jersey, apparel, and print design. Known for delivering clean, elevated visuals with strong attention to detail and a premium finish.",
    image: faizImg,
    imageClass: "object-[center_40%]",
  },
  {
    name: "HARITH ACD",
    role: "Designer",
    bio: "Brings bold, creative concepts to life with an eye for detail and a passion for standout sportswear design.",
    image: harithImg,
    imageClass: "object-[center_40%]",
  },
  {
    name: "ADAM ACD",
    role: "Designer",
    bio: "Specializes in modern, dynamic jersey layouts that combine functionality with cutting-edge visual appeal.",
    image: adamImg,
    imageClass: "object-[center_40%]",
  },
];

type Person = {
  name: string;
  role: string;
  bio: string;
  image: string;
  imageClass?: string;
  phone?: string;
  whatsapp?: string;
};

const AgentCard = ({ person, index }: { person: Person; index: number }) => (
  <div className="group relative flex flex-col bg-card border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden">
    {/* Number badge */}
    <div className="absolute top-4 left-4 z-10 font-display text-[10px] tracking-[0.3em] text-muted-foreground/60 uppercase">
      {String(index + 1).padStart(2, "0")}
    </div>

    {/* Image */}
    <div className="relative h-72 overflow-hidden bg-secondary">
      <img
        src={person.image}
        alt={person.name}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${person.imageClass || ""}`}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

      {/* Name on image */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-display text-2xl text-foreground leading-none tracking-wide">
          {person.name}
        </h3>
        <p className="text-primary text-xs font-medium tracking-[0.15em] uppercase mt-1">
          {person.role}
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col flex-1 p-5 gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed flex-1">
        {person.bio}
      </p>

      {person.phone && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono border-t border-border pt-4">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{person.phone}</span>
        </div>
      )}

      {person.whatsapp && (
        <a
          href={person.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full bg-primary text-primary-foreground px-4 py-3 text-xs font-display uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors group/btn"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </a>
      )}
    </div>
  </div>
);

const DesignerCard = ({ person, index }: { person: Person; index: number }) => (
  <div className="group relative flex gap-5 p-5 bg-card border border-border hover:border-primary/40 transition-all duration-300">
    {/* Image */}
    <div className="relative w-20 h-20 shrink-0 overflow-hidden bg-secondary">
      <img
        src={person.image}
        alt={person.name}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${person.imageClass || ""}`}
      />
    </div>

    {/* Content */}
    <div className="flex flex-col justify-center gap-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-display text-lg text-foreground leading-none">
          {person.name}
        </h3>
        <span className="text-[10px] font-display uppercase tracking-[0.2em] text-primary border border-primary/30 px-2 py-0.5">
          {person.role}
        </span>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed mt-1">
        {person.bio}
      </p>
      {person.whatsapp && (
        <a
          href={person.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1 font-medium"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {person.phone}
        </a>
      )}
    </div>
  </div>
);

const Agents = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* ───── Hero ───── */}
    <section className="relative min-h-[70vh] flex items-end overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        <img src={teamBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80" />
        {/* Diagonal accent line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-[30%] w-px h-full bg-border/40" />
          <div className="absolute top-0 right-[60%] w-px h-full bg-border/20" />
        </div>
      </div>

      <div className="container max-w-6xl relative z-10 pb-16 pt-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="space-y-5">
            <p className="font-display text-accent uppercase tracking-[0.4em] text-[10px]">
              The Team · ACD Jersey
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-foreground uppercase tracking-tight leading-[0.85]">
              Meet the <br />
              <span className="text-primary">People</span>
            </h1>
            <p className="text-foreground/60 max-w-sm text-sm md:text-base leading-relaxed">
              Real humans. Direct contact. From your first message to the final delivery — we've got you.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <span className="inline-flex items-center gap-2 border border-border bg-card/50 backdrop-blur-sm px-4 py-2.5 text-[11px] font-display uppercase tracking-[0.2em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Mon–Sat · 9am–6pm
            </span>
            <span className="inline-flex items-center gap-2 border border-border bg-card/50 backdrop-blur-sm px-4 py-2.5 text-[11px] font-display uppercase tracking-[0.2em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              Based in Malaysia
            </span>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-display uppercase tracking-[0.2em]">
                Available now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ───── Stats bar ───── */}
    <section className="border-b border-border bg-card/50">
      <div className="container max-w-6xl">
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { value: "6", label: "Sales Executives" },
            { value: "3", label: "Studio Designers" },
            { value: "4+", label: "Years Experience" },
          ].map((stat) => (
            <div key={stat.label} className="py-6 px-4 md:px-8 text-center md:text-left">
              <p className="font-display text-3xl md:text-4xl text-foreground">{stat.value}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-display mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ───── Sales Executives ───── */}
    <section className="container max-w-6xl py-16 md:py-24">
      <div className="flex items-end justify-between gap-4 mb-12 flex-wrap">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-accent mb-3">
            01 — Sales
          </p>
          <h2 className="text-3xl md:text-5xl font-display text-foreground uppercase tracking-tight leading-none">
            Our Sales <br className="hidden md:block" />Executives
          </h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-xs">
          Pick anyone — they all know your order and share notes between them.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {agents.map((a, i) => (
          <div key={a.name} className="bg-background">
            <AgentCard person={a} index={i} />
          </div>
        ))}
      </div>
    </section>

    {/* ───── Divider ───── */}
    <div className="container max-w-6xl">
      <div className="border-t border-border" />
    </div>

    {/* ───── Designers ───── */}
    <section className="container max-w-6xl py-16 md:py-24">
      <div className="flex items-end justify-between gap-4 mb-12 flex-wrap">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-accent mb-3">
            02 — Studio
          </p>
          <h2 className="text-3xl md:text-5xl font-display text-foreground leading-tight">
            The hands behind <br className="hidden md:block" />every design.
          </h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-xs">
          Precision, craft, and years of jersey design experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-px bg-border">
        {designers.map((d, i) => (
          <div key={d.name} className="bg-background">
            <DesignerCard person={d} index={i} />
          </div>
        ))}
      </div>
    </section>

    {/* ───── Closing CTA ───── */}
    <section className="border-t border-border bg-card/30">
      <div className="container max-w-6xl py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-3">
            <p className="font-display text-[10px] uppercase tracking-[0.4em] text-accent">
              Not sure who to message?
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground leading-tight uppercase">
              Just message <br />anyone — <br />
              <span className="text-muted-foreground">we share notes.</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed md:text-right">
            Whoever picks up first will own your enquiry. No bouncing between people. No repeating yourself.
          </p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Agents;
