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
import WhatsAppButton from "@/components/WhatsAppButton";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://nestvault.in/#business",
      name: "Nest Vault",
      alternateName: "Nest Vault Coworking",
      description:
        "Hyderabad's most prestigious co-working ecosystem. Private cabins, dedicated desks, meeting rooms, and virtual offices near Madhapur Metro, Jubilee Hills.",
      url: "https://nestvault.in",
      telephone: "+919142696666",
      email: "hello@nestvault.in",
      image: "https://nestvault.in/images/lounge-wide.jpg",
      logo: "https://nestvault.in/images/logo-full.png",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Road No. 36",
        addressLocality: "Jubilee Hills",
        addressRegion: "Telangana",
        postalCode: "500033",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "17.4318",
        longitude: "78.4072",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "22:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Saturday", "Sunday"],
          opens: "09:00",
          closes: "20:00",
        },
      ],
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "High-Speed WiFi", value: true },
        { "@type": "LocationFeatureSpecification", name: "Meeting Rooms", value: true },
        { "@type": "LocationFeatureSpecification", name: "Private Cabins", value: true },
        { "@type": "LocationFeatureSpecification", name: "Cafeteria", value: true },
        { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
        { "@type": "LocationFeatureSpecification", name: "24x7 Access", value: true },
        { "@type": "LocationFeatureSpecification", name: "Virtual Office", value: true },
      ],
      sameAs: [
        "https://www.facebook.com/profile.php?id=61560417632949",
        "https://www.instagram.com/nest_vault",
        "https://x.com/Nestvault",
        "https://youtube.com/@nestvault",
        "https://www.threads.net/@nest_vault",
      ],
      hasMap: "https://maps.google.com/?q=Nest+Vault+Jubilee+Hills+Hyderabad",
      areaServed: {
        "@type": "City",
        name: "Hyderabad",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://nestvault.in/#website",
      url: "https://nestvault.in",
      name: "Nest Vault",
      description: "Premium Co-working Space in Hyderabad",
      publisher: { "@id": "https://nestvault.in/#business" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://nestvault.in/#contact",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://nestvault.in",
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
      <WhatsAppButton />
    </>
  );
}
