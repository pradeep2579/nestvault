import { NextRequest, NextResponse } from "next/server";
import { db, actor } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const current = await actor();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return NextResponse.json({ error: "Choose a JPG, PNG, or WebP image under 5 MB" }, { status: 400 });
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  const path = `${current.id}/${crypto.randomUUID()}.${extension}`;
  const client = db();
  const { error } = await client.storage.from("blog-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  return NextResponse.json({ url: client.storage.from("blog-images").getPublicUrl(path).data.publicUrl });
}
