import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import About from "@/components/About";
import WorkspaceCatalog from "@/components/WorkspaceCatalog";
import Amenities from "@/components/Amenities";
import WhyNestVault from "@/components/WhyNestVault";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <About />
        <WorkspaceCatalog />
        <Amenities />
        <WhyNestVault />
        <Pricing />
        <Gallery />
        <Testimonials />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
