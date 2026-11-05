import { requirePageActor } from "@/lib/admin-page";
import PostForm from "@/components/admin/PostForm";
type Props = { searchParams: Promise<{ error?: string }> };
export default async function NewPost({ searchParams }: Props) { const current = await requirePageActor(); return <PostForm role={current.role} error={(await searchParams).error} />; }
