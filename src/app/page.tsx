import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import About from "@/components/About";
import WorkspaceCatalog from "@/components/WorkspaceCatalog";
import Amenities from "@/components/Amenities";
import WhyNestVault from "@/components/WhyNestVault";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import SpaceTour from "@/components/SpaceTour";
import Testimonials from "@/components/Testimonials";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BlogSection from "@/components/BlogSection";
import { homeSeo, publicPosts } from "@/lib/public-data";
import { absoluteUrl } from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await homeSeo();
  return { title: { absolute: seo.title }, description: seo.description,
    alternates: { canonical: seo.canonical_url || "/" },
    robots: { index: !seo.noindex, follow: !seo.noindex },
    openGraph: { title: seo.title, description: seo.description, url: seo.canonical_url || "/",
      images: seo.social_image ? [{ url: seo.social_image, alt: seo.social_image_alt || seo.title }] : [] },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description,
      images: seo.social_image ? [seo.social_image] : [] } };
}

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
      email: "community@nestvault.in",
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
        latitude: "17.4353397",
        longitude: "78.4014406",
      },
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
      hasMap: "https://www.google.com/maps/place/Nest+Vault+Coworking+space/@17.4353397,78.3988657,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb9177b8e748bf:0x65432d6fc2820c1e!8m2!3d17.4353397!4d78.4014406",
      areaServed: {
        "@type": "City",
        name: "Hyderabad",
      },
    },
    { "@type": "WebSite", "@id": "https://nestvault.in/#website", url: "https://nestvault.in",
      name: "Nest Vault", publisher: { "@id": "https://nestvault.in/#business" } },
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

export default async function HomePage() {
  const [posts, seo] = await Promise.all([publicPosts(3), homeSeo()]);
  const graph = structuredClone(jsonLd);
  Object.assign(graph["@graph"][0], seo.business_json, { url: absoluteUrl("/") });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
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
        <SpaceTour />
        <Testimonials />
        <BlogSection posts={posts} />
        <Location />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
