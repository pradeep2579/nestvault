import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";
import { publicPosts } from "@/lib/public-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog", description: "Ideas and guides for better work from Nest Vault.", alternates: { canonical: "/blog" },
  openGraph: { title: "Nest Vault Blog", description: "Ideas and guides for better work from Nest Vault.", url: "/blog" } };

export default async function BlogPage() {
  const posts = await publicPosts();
  return <><Navbar /><main style={{ paddingTop: 72 }}><div className="container" style={{ paddingTop: "4rem" }}><Link href="/">← Home</Link></div><BlogSection posts={posts} /></main><Footer /></>;
}
