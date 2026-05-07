import { Phone, MessageCircle, ArrowUpRight, MapPin, Clock } from "lucide-react";
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
    imageClass: "scale-[1.8] object-[center_55%]",
  },
  {
    name: "HILMAN ACD",
    phone: "011-5929 4190",
    whatsapp: "https://wa.me/601159294190",
    role: "Sales Executive / Web & Data Engineer",
    bio: "Ready to help you find the perfect apparel for your team, event, or brand 👕✨ Always here to make the process smooth from start to finish 🙌",
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

/* ──────────────────────────────────────────────────────────── */
/* Roster card — split layout, image left + info right          */
/* ──────────────────────────────────────────────────────────── */
type Person = {
  name: string;
  role: string;
  bio: string;
  image: string;
  imageClass?: string;
  phone?: string;
  whatsapp?: string;
};

const RosterCard = ({ person, index }: { person: Person; index: number }) => (
  <article className="group relative flex gap-4 sm:gap-6 rounded-2xl border border-border bg-card hover:border-accent/40 transition-all duration-500 p-4 sm:p-6 overflow-hidden">
    {/* Index */}
    <span className="absolute top-3 right-4 font-display text-[10px] tabular-nums tracking-[0.25em] text-muted-foreground/60">
      {String(index + 1).padStart(2, "0")}
    </span>

    {/* Portrait */}
    <div className="relative flex-shrink-0 w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-secondary">
      <img
        src={person.image}
        alt={person.name}
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${person.imageClass || ""}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex-1 space-y-1.5">
        <h3 className="font-display text-base sm:text-lg text-foreground leading-tight pr-8">
          {person.name}
        </h3>
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent">
          {person.role}
        </p>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3 pt-1">
          {person.bio}
        </p>
      </div>

      {/* Contact */}
      {person.whatsapp && (
        <div className="mt-4 flex flex-col gap-2">
          {person.phone && (
            <span className="inline-flex items-center gap-2 text-muted-foreground text-xs font-display tabular-nums">
              <Phone className="h-3 w-3 text-accent" />
              {person.phone}
            </span>
          )}
          <a
            href={person.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-display text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
            <ArrowUpRight className="h-3 w-3 opacity-60" />
          </a>
        </div>
      )}
    </div>
  </article>
);

const Agents = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* ───── Hero ───── */}
    <section className="relative py-20 md:py-24 animate-slide-up overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        <img src={teamBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      <div className="container max-w-5xl relative z-10 space-y-6">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-xs">
          The Team
        </p>
        <h1 className="text-4xl md:text-6xl font-display text-foreground uppercase tracking-tight leading-[0.9]">
          Get in touch <br /> with us
        </h1>
        <p className="text-foreground/70 max-w-xl text-base md:text-lg leading-relaxed">
          No bots, no call centres. Contact our team directly — they'll handle your enquiry, quote, and order from start to finish.
        </p>

        <div className="flex flex-wrap gap-3 pt-4">
          <span className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-accent" />
            Mon–Sat · 9am–6pm
          </span>
          <span className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            Based in Malaysia
          </span>
        </div>
      </div>
    </section>

    {/* ───── Sales executives ───── */}
    <section className="container max-w-6xl py-16 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div className="space-y-2">
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-accent">
            01 — Sales
          </p>
          <h2 className="text-3xl md:text-4xl font-display text-foreground uppercase tracking-wider leading-tight">
            Our Sales Executives
          </h2>
        </div>
        <div className="text-muted-foreground text-sm max-w-xs">
          {" "}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {agents.map((a, i) => (
          <RosterCard key={a.name} person={a} index={i} />
        ))}
      </div>
    </section>

    {/* ───── Designers ───── */}
    <section className="border-t border-border bg-card/30">
      <div className="container max-w-6xl py-16 md:py-20">
        <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
          <div className="space-y-2">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-accent">
              02 — Studio
            </p>
            <h2 className="text-3xl md:text-4xl font-display text-foreground leading-tight">
              The hands behind every design.
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            Our in-house design team works with you from sketch to final print.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {designers.map((d, i) => (
            <RosterCard key={d.name} person={d} index={i} />
          ))}
        </div>
      </div>
    </section>

    {/* ───── Closing band ───── */}
    <section className="container max-w-4xl py-20 text-center space-y-5">
      <p className="font-display text-[11px] uppercase tracking-[0.3em] text-accent">
        Not sure who to message?
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-foreground leading-tight">
        Just message anyone — we share notes.
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto text-sm">
        Whoever picks up first will own your enquiry. No bouncing between people.
      </p>
    </section>

    <Footer />
  </div>
);

export default Agents;
