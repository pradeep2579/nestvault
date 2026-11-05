import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import type { Post } from "@/lib/public-data";
import { canEditPost } from "@/lib/content";
import PostForm from "@/components/admin/PostForm";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> };
export default async function EditPost({ params, searchParams }: Props) {
  const current = await requirePageActor();
  const { data } = await db().from("posts").select("*").eq("id", (await params).id).maybeSingle();
  if (!data || !canEditPost(current, data)) notFound();
  const query = await searchParams;
  return <>{query.saved && <p className="admin-success">Article saved.</p>}<PostForm post={data as Post} role={current.role} error={query.error} /></>;
}
