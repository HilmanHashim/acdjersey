import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Zap, Palette, Award, DollarSign, ArrowUpRight, MessageCircle, Target, Compass } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";

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
  { icon: Shield, title: "Superior Quality", desc: "Variety of materials with premium quality to pick from." },
  { icon: Zap, title: "Fast Turnaround", desc: "Bulk orders delivered in 7-14 days. No drawn-out lead times." },
  {
    icon: Palette,
    title: "Custom Designs",
    desc: "Our designers work hand-in-hand with you to create something unmistakable.",
  },
  {
    icon: Award,
    title: "Trusted by Top Brands",
    desc: "From Volvo Ingress Swede to Malaysian government bodies — we deliver.",
  },
  { icon: DollarSign, title: "Competitive Pricing", desc: "Premium quality, honest pricing. No hidden costs." },
];

const products = [
  {
    title: "Fashion Sport Shirts",
    details: [
      "Ultron Superlite 115GSM, Mini Square 105GSM, Sparkling Ultralite 120GSM",
      "Sweat-absorbent, lightweight, breathable",
      "Customizable designs tailored to your needs",
    ],
  },
  {
    title: "Muslimah Running Shirts",
    details: ["Shariah-compliant design", "Longer cuts for better coverage", "Fabric: Ultron Superlite 115GSM"],
  },
  {
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
    items: ["GLC Agencies", "Government Agencies", "Government Schools", "Private & International Schools"],
  },
  { category: "Community Partners", items: ["Running Groups Across Malaysia", "Sports Clubs", "Fitness Enthusiasts"] },
];

const AboutUs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* ───── Hero (original) ───── */}
    <section className="relative py-20 animate-slide-up overflow-hidden">
      <img src={whoWeAreBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div className="container max-w-3xl text-center space-y-6 relative z-10">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">About Us</p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient title-glow inline-block">Who We Are</h1>
        <p className="text-foreground/80 text-lg leading-relaxed">
          ACD is a premium sublimation clothing service provider specializing in sport fashion apparel. We pride
          ourselves on delivering top-notch quality and customization to meet the needs of our clients. With a focus on
          innovation, we cater to running groups, events, and organizations seeking lightweight, comfortable, and
          stylish apparel.
        </p>
      </div>
    </section>

    {/* ───── Mission & Vision — split with vertical labels ───── */}
    <section className="py-20 border-y border-border/50">
      <div className="container max-w-5xl">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="md:pr-12 pb-10 md:pb-0 space-y-5">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-accent" />
              <span className="font-display text-xs uppercase tracking-[0.4em] text-accent">Mission</span>
            </div>
            <p className="font-display text-2xl md:text-3xl text-foreground leading-snug">
              Empower people with apparel that performs as hard as they do.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              High-quality, customized apparel that looks good, enhances performance, and reflects who you are.
            </p>
          </div>
          <div className="md:pl-12 pt-10 md:pt-0 space-y-5">
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-accent" />
              <span className="font-display text-xs uppercase tracking-[0.4em] text-accent">Vision</span>
            </div>
            <p className="font-display text-2xl md:text-3xl text-foreground leading-snug">
              The most trusted name in fashion sport apparel.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Unmatched quality, unmatched service — every order, every team, every time.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ───── Why Choose Us — alternating list ───── */}
    <section className="relative py-20 overflow-hidden">
      <img src={whyChooseUsBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div className="relative container max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Why Choose Us</p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient title-glow inline-block">
            Five reasons teams come back.
          </h2>
        </div>

        <ol className="space-y-3">
          {whyChooseUs.map((item, i) => (
            <li
              key={item.title}
              className={`group flex items-start gap-5 md:gap-8 p-5 md:p-7 rounded-2xl bg-background/80 border border-border hover:border-accent/40 hover:bg-background transition-all duration-300 ${
                i % 2 === 1 ? "md:ml-12" : "md:mr-12"
              }`}
            >
              <span className="font-display text-3xl md:text-4xl text-muted-foreground/40 tabular-nums leading-none pt-1 group-hover:text-accent transition-colors">
                0{i + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-accent" />
                  <h3 className="font-display text-lg md:text-xl text-foreground">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* ───── Products (kept close to original cards) ───── */}
    <section className="py-20">
      <div className="container space-y-12 max-w-5xl">
        <div className="text-center space-y-3">
          <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Our Products</p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient title-glow inline-block">Three core lines.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.title} className="bg-card border-border card-lift">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display text-xl text-foreground">{product.title}</h3>
                <ul className="space-y-2">
                  {product.details.map((d, i) => (
                    <li key={i} className="text-muted-foreground text-sm flex gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* ───── Clients — two-column with chip tags ───── */}
    <section className="py-20 bg-card/40 border-y border-border/50">
      <div className="container max-w-5xl space-y-12">
        <div className="text-center space-y-3">
          <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Our Clients</p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient title-glow inline-block">
            From running groups to government.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {clientTypes.map((group) => (
            <div key={group.category} className="space-y-5 p-8 rounded-2xl bg-background border border-border">
              <h3 className="font-display text-lg text-foreground">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground text-xs font-display hover:border-accent hover:text-accent transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ───── Trusted By marquee with fades ───── */}
    <section className="py-20 overflow-hidden">
      <div className="container space-y-10 max-w-5xl">
        <div className="text-center space-y-3">
          <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">Trusted By</p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient title-glow inline-block">
            The names on our jerseys.
          </h2>
        </div>
      </div>
      <div className="relative mt-10">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee gap-8 w-max">
          {[...clientLogos, ...clientLogos].map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="bg-white rounded-lg p-4 w-28 h-28 md:w-36 md:h-36 flex-shrink-0 flex items-center justify-center shadow-sm border border-border overflow-hidden"
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

    {/* ───── CTA — minimal centered band ───── */}
    <section className="container max-w-3xl pb-24 text-center space-y-6">
      <h2 className="font-display text-3xl md:text-5xl text-foreground leading-tight">Got a team to dress?</h2>
      <p className="text-muted-foreground max-w-lg mx-auto">
        Tell us what you need — quantity, fabric, deadline. We'll come back with a quote and design ideas.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to="/enquiry"
          className="inline-flex items-center gap-2 hero-gradient text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg"
        >
          Start an enquiry <ArrowUpRight className="h-4 w-4" />
        </Link>
        <a
          href="https://t.me/acdjersey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-display text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:border-accent hover:text-accent transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          Updates on our Telegram
        </a>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutUs;
