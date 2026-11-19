import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, actor } from "@/lib/supabase";
import { leadCsvColumns, readCsvLead } from "@/lib/leads-csv";

export async function POST(request: NextRequest) {
  if (!await actor()) return NextResponse.json({ error: "Sign in to add leads." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });

  try {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Enter the lead details." }, { status: 400 });
    // Reuse the CSV validation so manual and imported leads follow the same rules.
    const columns = [...leadCsvColumns];
    const values = columns.map(column => typeof body[column] === "string" ? (body[column] as string) : "");
    const lead = readCsvLead(columns, values);
    const identity = lead.email ? `email:${lead.email}` : `phone:${lead.phone.replace(/\D/g, "")}`;
    if (identity.startsWith("phone:") && identity.length < 13) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });

    const client = db();
    if (lead.email) {
      const { data, error } = await client.from("leads").select("id").eq("email", lead.email).limit(1);
      if (error) throw error;
      if (data?.length) return NextResponse.json({ error: "A lead with this email already exists.", id: data[0].id }, { status: 409 });
    }
    if (lead.phone) {
      const { data, error } = await client.from("leads").select("id").eq("phone", lead.phone).limit(1);
      if (error) throw error;
      if (data?.length) return NextResponse.json({ error: "A lead with this phone already exists.", id: data[0].id }, { status: 409 });
    }
    const dedupe_key = `offline:${createHash("sha256").update(identity).digest("hex")}`;
    const { data, error } = await client.from("leads").upsert({ ...lead, source: "offline", dedupe_key }, { onConflict: "dedupe_key", ignoreDuplicates: true }).select("id");
    if (error) return NextResponse.json({ error: "Could not save this lead." }, { status: 500 });
    if (!data?.length) return NextResponse.json({ error: "This contact already exists." }, { status: 409 });
    revalidatePath("/admin/leads");
    return NextResponse.json({ id: data[0].id });
  } catch (error) {
    const known = error instanceof Error && /required|Invalid|too long|timezone/.test(error.message);
    return NextResponse.json({ error: known ? (error as Error).message : "Could not save this lead." }, { status: known ? 400 : 500 });
  }
}
