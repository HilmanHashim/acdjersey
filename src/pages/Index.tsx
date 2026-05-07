import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Gallery from "@/components/landing/Gallery";
import Services from "@/components/landing/Services";
import Clients from "@/components/landing/Clients";
import Reviews from "@/components/landing/Reviews";
import Map from "@/components/landing/Map";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <>
    <Navbar />
    <Hero />
    <About />
    <Gallery />
    <Services />
    <Clients />
    <Reviews />
    <Map />
    <Footer />
  </>
);

export default Index;
