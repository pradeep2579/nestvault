import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nest Vault — Premium Co-working Space in Hyderabad",
  description:
    "Hyderabad's most prestigious co-working ecosystem. Private cabins, dedicated desks, meeting rooms, and virtual offices near Madhapur Metro, Jubilee Hills.",
  keywords:
    "coworking space Hyderabad, premium workspace Jubilee Hills, private office Hyderabad, startup workspace Madhapur, virtual office Hyderabad",
  openGraph: {
    title: "Nest Vault — Premium Co-working Space",
    description: "Where founders, creators, and enterprises thrive.",
    type: "website",
    locale: "en_IN",
  },
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
