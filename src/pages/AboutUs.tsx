import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Shield,
  Zap,
  Palette,
  Award,
  DollarSign,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";
import whoWeAreBg from "@/assets/who-we-are-bg.jpeg";
import whyChooseUsBg from "@/assets/why-choose-us-bg.jpeg";

import logoUis from "@/assets/logos/uis.png";
import logoSwcorp from "@/assets/logos/swcorp.png";
import logoJpj from "@/assets/logos/jpj.png";
import logoNavy from "@/assets/logos/navy.png";
import logoMrcb from "@/assets/logos/mrcb.png";
import logoHsb from "@/assets/logos/hsb.png";
import logoVolvo from "@/assets/logos/volvo.jpg";
import logoUitm from "@/assets/logos/uitm.png";
import logoAadk from "@/assets/logos/aadk.gif";
import logoKlust from "@/assets/logos/klust.jfif";
import logoBomba from "@/assets/logos/bomba.png";

const clientLogos = [
  { src: logoUis, alt: "Universiti Islam Selangor" },
  { src: logoSwcorp, alt: "SWCorp Malaysia" },
  { src: logoJpj, alt: "Jabatan Pengangkutan Jalan Malaysia" },
  { src: logoNavy, alt: "Royal Malaysian Navy" },
  { src: logoMrcb, alt: "MRCB" },
  { src: logoHsb, alt: "Hospital Sungai Buloh" },
  { src: logoVolvo, alt: "Volvo Ingress Swede Automobile", zoom: true },
  { src: logoUitm, alt: "Universiti Teknologi MARA" },
  { src: logoAadk, alt: "Agensi Antidadah Kebangsaan" },
  { src: logoKlust, alt: "KLUST" },
  { src: logoBomba, alt: "Bomba Dan Penyelamat Malaysia" },
];

const whyChooseUs = [
  { icon: Shield, title: "Superior Quality", desc: "Premium fabrics like Ultron Superlite — durable, comfortable, built to last." },
  { icon: Zap, title: "Fast Turnaround", desc: "Bulk orders delivered in 7 days. No drawn-out lead times." },
  { icon: Palette, title: "Custom Designs", desc: "Our designers work hand-in-hand with you to create something unmistakable." },
  { icon: Award, title: "Trusted by Top Brands", desc: "From Volvo Ingress Swede to Malaysian government bodies — we deliver." },
  { icon: DollarSign, title: "Competitive Pricing", desc: "Premium quality, honest pricing. No hidden costs." },
];

const products = [
  {
    index: "01",
    title: "Fashion Sport Shirts",
    details: [
      "Ultron Superlite 115GSM, Mini Square 105GSM, Sparkling Ultralite 120GSM",
      "Sweat-absorbent, lightweight, breathable",
      "Customizable designs tailored to your needs",
    ],
  },
  {
    index: "02",
    title: "Muslimah Running Shirts",
    details: [
      "Shariah-compliant design",
      "Longer cuts for better coverage",
      "Fabric: Ultron Superlite 115GSM",
    ],
  },
  {
    index: "03",
    title: "Event Jerseys",
    details: [
      "For marathons, fun runs, and charity events",
      "Quick production time (under 7 days)",
      "Free design services",
    ],
  },
];

const clientTypes = [
  {
    category: "Corporate Partners",
    items: [
      "GLC Agencies",
      "Government Agencies",
      "Government Schools",
      "Private & International Schools",
    ],
  },
  {
    category: "Community Partners",
    items: [
      "Running Groups Across Malaysia",
      "Sports Clubs",
      "Fitness Enthusiasts",
    ],
  },
];

/* ────────────────────────────────────────────────────────── */
/* Editorial section header                                    */
/* ────────────────────────────────────────────────────────── */
const SectionHeader = ({
  index,
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  index: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) => (
  <div
    className={`flex flex-col gap-4 mb-10 ${
      align === "center" ? "items-center text-center" : "items-start"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="font-display text-xs uppercase tracking-[0.3em] text-accent">
        {index} / {eyebrow}
      </span>
      <span className="h-px w-16 bg-gradient-to-r from-accent/50 to-transparent" />
    </div>
    <h2 className="text-4xl md:text-6xl font-display text-foreground leading-[0.95] max-w-3xl">
      {title}
    </h2>
    {subtitle && (
      <p
        className={`text-muted-foreground text-base max-w-xl ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const AboutUs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* ───── Hero ───── */}
    <section className="relative overflow-hidden border-b border-border">
      <img
        src={whoWeAreBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-background/60" />

      <div className="relative container max-w-6xl py-20 md:py-32">
        <div className="space-y-6 max-w-3xl animate-slide-up">
          <h1 className="font-display text-foreground leading-[0.9] text-5xl md:text-7xl lg:text-8xl">
            Built by <span className="text-gradient">runners.</span>
            <br />
            Made for <span className="text-gradient">teams.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl">
            ACD is a premium sublimation apparel maker. We design, print, and deliver custom jerseys for running groups, schools, agencies, and brands across Malaysia.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 hero-gradient text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg"
            >
              Browse the catalogue <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/enquiry"
              className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-display text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:border-accent hover:text-accent transition-all"
            >
              Request a quote
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-8 pt-8 border-t border-border/50 mt-8">
            {[
              { n: "10+", l: "Years in jerseys" },
              { n: "500+", l: "Teams dressed" },
              { n: "7 days", l: "Turnaround" },
              { n: "100%", l: "Customizable" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-2xl md:text-3xl text-foreground">{s.n}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ───── Mission & Vision — bento ───── */}
    <section className="container max-w-6xl py-16 md:py-24">
      <SectionHeader
        index="01"
        eyebrow="Our Compass"
        title="What drives every stitch."
        subtitle="A clear mission, a sharper vision — and a relentless focus on the people wearing what we make."
      />

      <div className="grid md:grid-cols-5 gap-4 md:gap-5">
        {/* Mission — feature */}
        <div className="md:col-span-3 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-8 md:p-12 group hover:border-accent/40 transition-all duration-500">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative space-y-4">
            <span className="font-display text-xs uppercase tracking-[0.3em] text-accent">
              Mission
            </span>
            <h3 className="font-display text-3xl md:text-4xl text-foreground leading-[0.95]">
              Empower people with apparel that performs as hard as they do.
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              High-quality, customized apparel that looks good, enhances performance, and reflects who you are.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10 group hover:border-accent/40 transition-all duration-500">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="relative space-y-4">
            <span className="font-display text-xs uppercase tracking-[0.3em] text-accent">
              Vision
            </span>
            <h3 className="font-display text-2xl md:text-3xl text-foreground leading-[0.95]">
              The most trusted name in fashion sport apparel.
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Unmatched quality, unmatched service — every order, every team, every time.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ───── Why Choose Us ───── */}
    <section className="relative overflow-hidden border-y border-border bg-card/30 scroll-mt-32">
      <img
        src={whyChooseUsBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />

      <div className="relative container max-w-6xl py-16 md:py-24">
        <SectionHeader
          index="02"
          eyebrow="Why ACD"
          title="Five reasons teams keep coming back."
          subtitle="It's not just shirts. It's how we make them, how fast we ship, and who we stand behind."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {whyChooseUs.map((item, i) => (
            <div
              key={item.title}
              className="group relative rounded-2xl border border-border bg-card hover:border-accent/40 transition-all duration-500 p-6 overflow-hidden"
            >
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-[10px] text-muted-foreground tabular-nums tracking-[0.2em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-px flex-1 bg-border group-hover:bg-accent/40 transition-colors" />
              </div>
              <item.icon className="h-7 w-7 text-accent mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2 leading-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ───── Products ───── */}
    <section className="container max-w-6xl py-16 md:py-24">
      <SectionHeader
        index="03"
        eyebrow="What We Make"
        title="Three core lines. Endless variations."
      />

      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {products.map((product) => (
          <div
            key={product.title}
            className="group relative rounded-2xl border border-border bg-card hover:border-accent/40 transition-all duration-500 p-6 md:p-8 overflow-hidden"
          >
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display text-xs text-accent tabular-nums tracking-[0.2em]">
                {product.index}
              </span>
              <div className="h-px flex-1 bg-border group-hover:bg-accent/40 transition-colors" />
            </div>
            <h3 className="font-display text-2xl text-foreground mb-5 leading-tight">
              {product.title}
            </h3>
            <ul className="space-y-3">
              {product.details.map((d, i) => (
                <li key={i} className="text-muted-foreground text-sm flex gap-3 leading-relaxed">
                  <span className="text-accent mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    {/* ───── Clients ───── */}
    <section className="border-y border-border bg-card/30">
      <div className="container max-w-6xl py-16 md:py-24">
        <SectionHeader
          index="04"
          eyebrow="Who We Serve"
          title="From running groups to government."
        />

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {clientTypes.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-border bg-card p-8 hover:border-accent/40 transition-all duration-500"
            >
              <h3 className="font-display text-xl text-foreground mb-5">{group.category}</h3>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="text-muted-foreground text-sm flex gap-3 leading-relaxed">
                    <span className="text-accent mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ───── Trusted By marquee ───── */}
    <section className="overflow-hidden py-16 md:py-24">
      <div className="container max-w-6xl">
        <SectionHeader
          index="05"
          eyebrow="Trusted By"
          title="The names on our jerseys."
        />
      </div>
      <div className="relative mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee gap-6 w-max">
          {[...clientLogos, ...clientLogos].map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="bg-white rounded-2xl p-4 w-28 h-28 md:w-36 md:h-36 flex-shrink-0 flex items-center justify-center shadow-sm border border-border overflow-hidden"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className={`max-w-full max-h-full object-contain ${logo.zoom ? "scale-[2.5]" : ""}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ───── CTA band ───── */}
    <section className="container max-w-6xl pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-8 md:p-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary blur-3xl" />
        </div>

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="font-display text-xs uppercase tracking-[0.3em] text-accent">
              06 / Let's Talk
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-foreground leading-[0.95]">
              Got a team to dress?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Tell us what you need — quantity, fabric, deadline. We'll come back with a quote and design ideas.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Link
              to="/enquiry"
              className="inline-flex items-center gap-3 hero-gradient text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-4 rounded-full hover:opacity-90 transition-opacity shadow-xl"
            >
              Start an enquiry
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="https://t.me/acdjersey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors px-4 py-2"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Or DM us on Telegram
            </a>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutUs;
