import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Gallery from "@/components/landing/Gallery";
import Services from "@/components/landing/Services";
import Clients from "@/components/landing/Clients";
import Reviews from "@/components/landing/Reviews";
import Map from "@/components/landing/Map";
import Footer from "@/components/landing/Footer";

const Divider = () => (
  <div className="container">
    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  </div>
);

const Index = () => (
  <>
    <Hero />
    <About />
    <Divider />
    <Gallery />
    <Divider />
    <Services />
    <Divider />
    <Clients />
    <Divider />
    <Reviews />
    <Divider />
    <Map />
    <Footer />
  </>
);

export default Index;
