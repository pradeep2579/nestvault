import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://nestvault.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nest Vault — Premium Co-working Space in Hyderabad",
    template: "%s | Nest Vault Hyderabad",
  },
  description:
    "Hyderabad's most prestigious co-working ecosystem. Private cabins, dedicated desks, meeting rooms, and virtual offices near Madhapur Metro, Jubilee Hills. Flexi passes from ₹499/day.",
  keywords: [
    "coworking space Hyderabad",
    "premium workspace Jubilee Hills",
    "private office Hyderabad",
    "startup workspace Madhapur",
    "virtual office Hyderabad",
    "dedicated desk Hyderabad",
    "meeting room Jubilee Hills",
    "co-working space near Madhapur Metro",
    "flexi desk Hyderabad",
    "office space for rent Hyderabad",
    "shared office Hyderabad",
    "enterprise coworking Hyderabad",
    "coworking Jubilee Hills",
    "best coworking Hyderabad",
  ],
  authors: [{ name: "Nest Vault", url: SITE_URL }],
  creator: "Nest Vault",
  publisher: "Nest Vault",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Nest Vault",
    title: "Nest Vault — Premium Co-working Space in Hyderabad",
    description:
      "Hyderabad's most prestigious co-working ecosystem. Private cabins, dedicated desks, meeting rooms & virtual offices near Madhapur Metro, Jubilee Hills.",
    images: [
      {
        url: "/images/lounge-wide.jpg",
        width: 1200,
        height: 630,
        alt: "Nest Vault Co-working Space — Jubilee Hills, Hyderabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Nestvault",
    creator: "@Nestvault",
    title: "Nest Vault — Premium Co-working Space in Hyderabad",
    description:
      "Hyderabad's most prestigious co-working ecosystem. Private cabins, dedicated desks & meeting rooms near Madhapur Metro.",
    images: ["/images/lounge-wide.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: "/manifest.json",
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
