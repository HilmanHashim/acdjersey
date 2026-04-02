import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Zap, Palette, Award, DollarSign } from "lucide-react";

import logoUis from "@/assets/logos/uis.png";
import logoSwcorp from "@/assets/logos/swcorp.png";
import logoJpj from "@/assets/logos/jpj.png";
import logoNavy from "@/assets/logos/navy.png";
import logoMrcb from "@/assets/logos/mrcb.png";
import logoHsb from "@/assets/logos/hsb.png";
import logoVolvo from "@/assets/logos/volvo.png";

const clientLogos = [
  { src: logoUis, alt: "Universiti Islam Selangor" },
  { src: logoSwcorp, alt: "SWCorp Malaysia" },
  { src: logoJpj, alt: "Jabatan Pengangkutan Jalan Malaysia" },
  { src: logoNavy, alt: "Royal Malaysian Navy" },
  { src: logoMrcb, alt: "MRCB" },
  { src: logoHsb, alt: "Hospital Sungai Buloh" },
  { src: logoVolvo, alt: "Volvo Ingress Swede Automobile" },
];
import { Card, CardContent } from "@/components/ui/card";

const whyChooseUs = [
  { icon: Shield, title: "Superior Quality", desc: "We use premium fabrics like Ultron Superlite, known for its durability and comfort." },
  { icon: Zap, title: "Fast Turnaround", desc: "Guaranteed delivery within 7 days for bulk orders." },
  { icon: Palette, title: "Custom Designs", desc: "Our team of designers works closely with clients to create unique and impactful designs." },
  { icon: Award, title: "Trusted by Top Brands", desc: "We have collaborated with major companies like Volvo Ingress Swede and government bodies in Malaysia." },
  { icon: DollarSign, title: "Competitive Pricing", desc: "Our prices reflect the superior quality and service we provide." },
];

const products = [
  {
    title: "Fashion Sport Shirts",
    details: [
      "Fabric: Ultron Superlite 115GSM, Mini Square 105GSM, Sparkling Ultralite 120GSM",
      "Sweat-absorbent, lightweight, and breathable",
      "Customizable designs tailored to your needs",
    ],
  },
  {
    title: "Muslimah Running Shirts",
    details: [
      "Shariah-compliant design",
      "Longer cuts for better coverage",
      "Fabric: Ultron Superlite 115GSM",
    ],
  },
  {
    title: "Event Jerseys",
    details: [
      "Suitable for marathons, fun runs, and charity events",
      "Quick production time (under 7 days)",
      "Free design services",
    ],
  },
];

const clientTypes = [
  { category: "Corporate Partners", items: ["GLC Agencies", "Government Agencies", "Government Schools", "Private & International Schools"] },
  { category: "Community Partners", items: ["Running Groups Across Malaysia", "Sports Clubs", "Fitness Enthusiasts"] },
];

const AboutUs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="surface-dark py-20 animate-slide-up">
      <div className="container max-w-3xl text-center space-y-6">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm">About Us</p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient">Who We Are</h1>
        <p className="text-surface-dark-foreground/70 text-lg leading-relaxed">
          ACD is a premium sublimation clothing service provider specializing in sport fashion apparel. We pride ourselves on delivering top-notch quality and customization to meet the needs of our clients. With a focus on innovation, we cater to running groups, events, and organizations seeking lightweight, comfortable, and stylish apparel.
        </p>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-16">
      <div className="container grid md:grid-cols-2 gap-8 max-w-4xl">
        <Card className="bg-card border-border">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-display text-gradient">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To empower people with high-quality, customized apparel that looks good and enhances performance while reflecting individuality.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-display text-gradient">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become the leading brand in the fashion sport apparel industry, delivering unparalleled quality and customer satisfaction.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* Why Choose Us */}
    <section className="py-16 bg-card">
      <div className="container space-y-10">
        <h2 className="text-3xl md:text-4xl font-display text-gradient text-center">Why Choose Us</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {whyChooseUs.map((item) => (
            <div key={item.title} className="p-6 rounded-lg bg-background border border-border space-y-3">
              <item.icon className="h-8 w-8 text-primary" />
              <h3 className="font-display text-lg text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Products */}
    <section className="py-16">
      <div className="container space-y-10">
        <h2 className="text-3xl md:text-4xl font-display text-gradient text-center">Our Products</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {products.map((product) => (
            <Card key={product.title} className="bg-card border-border">
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

    {/* Client Logos */}
    <section className="py-16">
      <div className="container space-y-10">
        <h2 className="text-3xl md:text-4xl font-display text-gradient text-center">Trusted By</h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-4xl mx-auto">
          {clientLogos.map((logo) => (
            <div key={logo.alt} className="bg-white rounded-lg p-4 w-28 h-28 md:w-36 md:h-36 flex items-center justify-center shadow-sm border border-border">
              <img src={logo.src} alt={logo.alt} className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Clients */}
    <section className="py-16 bg-card">
      <div className="container space-y-10">
        <h2 className="text-3xl md:text-4xl font-display text-gradient text-center">Our Clients</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {clientTypes.map((group) => (
            <div key={group.category} className="space-y-4">
              <h3 className="font-display text-lg text-foreground">{group.category}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-muted-foreground text-sm flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default AboutUs;
