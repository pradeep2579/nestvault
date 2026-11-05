import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, actor } from "@/lib/supabase";
import { importColumns, parseCsv, readCsvLead } from "@/lib/leads-csv";

const maxBytes = 1024 * 1024;
const maxRows = 500;

export async function POST(request: NextRequest) {
  if (!await actor()) return NextResponse.json({ error: "Sign in to import leads." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > maxBytes + 10000) return NextResponse.json({ error: "CSV must be under 1 MB." }, { status: 413 });

  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > maxBytes || !file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "Choose a .csv file under 1 MB." }, { status: 400 });
    }
    const rows = parseCsv(await file.text());
    if (rows.length < 2) return NextResponse.json({ error: "The CSV has no lead rows." }, { status: 400 });
    if (rows.length - 1 > maxRows) return NextResponse.json({ error: `Import up to ${maxRows} leads at a time.` }, { status: 400 });
    const columns = importColumns(rows[0]);
    const errors: { row: number; message: string }[] = [];
    const candidates: { row: number; lead: ReturnType<typeof readCsvLead>; key: string }[] = [];
    const seen = new Set<string>();
    let skipped = 0;
    for (const [index, values] of rows.slice(1).entries()) {
      try {
        const lead = readCsvLead(columns, values);
        const identity = lead.email ? `email:${lead.email}` : `phone:${lead.phone.replace(/\D/g, "")}`;
        if (identity === "phone:" || (identity.startsWith("phone:") && identity.length < 13)) throw new Error("Enter a valid phone number");
        if (seen.has(identity)) { skipped++; continue; }
        seen.add(identity);
        candidates.push({ row: index + 2, lead, key: `offline:${createHash("sha256").update(identity).digest("hex")}` });
      } catch (error) { errors.push({ row: index + 2, message: error instanceof Error ? error.message : "Invalid row" }); }
    }
    const client = db();
    const existing = new Set<string>();
    const emails = candidates.map(item => item.lead.email).filter(Boolean);
    const phones = candidates.map(item => item.lead.phone).filter(Boolean);
    if (emails.length) {
      const { data: matches, error } = await client.from("leads").select("email").in("email", emails);
      if (error) throw error;
      matches?.forEach(item => existing.add(`email:${item.email.toLowerCase()}`));
    }
    if (phones.length) {
      const { data: matches, error } = await client.from("leads").select("phone").in("phone", phones);
      if (error) throw error;
      matches?.forEach(item => existing.add(`phone:${(item.phone || "").replace(/\D/g, "")}`));
    }
    const toInsert = candidates.filter(item => {
      const emailKey = item.lead.email && `email:${item.lead.email}`;
      const phoneKey = item.lead.phone && `phone:${item.lead.phone.replace(/\D/g, "")}`;
      if ((emailKey && existing.has(emailKey)) || (phoneKey && existing.has(phoneKey))) { skipped++; return false; }
      if (emailKey) existing.add(emailKey);
      if (phoneKey) existing.add(phoneKey);
      return true;
    });
    let imported = 0;
    for (let offset = 0; offset < toInsert.length; offset += 50) {
      const batch = toInsert.slice(offset, offset + 50);
      const { data: saved, error } = await client.from("leads").upsert(batch.map(item => ({ ...item.lead, source: "offline", dedupe_key: item.key })),
        { onConflict: "dedupe_key", ignoreDuplicates: true }).select("id");
      if (error) { batch.forEach(item => errors.push({ row: item.row, message: "Could not save this row" })); continue; }
      imported += saved?.length || 0;
      skipped += batch.length - (saved?.length || 0);
    }
    if (imported) revalidatePath("/admin/leads");
    return NextResponse.json({ imported, skipped, rejected: errors.length, errors: errors.slice(0, 20) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && /CSV|columns|header/.test(error.message) ? error.message : "Import failed. Check the file and try again." }, { status: 400 });
  }
}
