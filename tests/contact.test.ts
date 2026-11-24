import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

type Row = { id: string; stage: string } | null;
const state = vi.hoisted(() => ({
  dedupe: false, count: 0, byEmail: null as Row, byPhone: null as Row, insertError: null as null | { code: string },
  staff: [] as { id: string }[], open: [] as { assigned_to: string | null }[],
  inserts: [] as { table: string; payload: Record<string, unknown> }[], updates: [] as { table: string; payload: Record<string, unknown> }[],
}));

vi.mock("@/lib/supabase", () => ({ db: () => ({ from: (table: string) => {
  const q = { head: false, filters: {} as Record<string, unknown> };
  const chain: Record<string, unknown> = {
    select: (_fields: string, options?: { head?: boolean }) => { q.head = !!options?.head; return chain; },
    eq: (key: string, value: unknown) => { q.filters[key] = value; return chain; },
    gte: () => chain, in: () => chain, not: () => chain, order: () => chain, limit: () => chain,
    maybeSingle: async () => ({ data: q.filters.dedupe_key ? (state.dedupe ? { id: "existing" } : null) : q.filters.email ? state.byEmail : q.filters.phone_key ? state.byPhone : null }),
    insert: (payload: Record<string, unknown>) => {
      state.inserts.push({ table, payload });
      const result = Promise.resolve({ error: table === "leads" ? state.insertError : null });
      return Object.assign(result, { select: () => ({ maybeSingle: async () => ({ data: state.insertError ? null : { id: "new-lead" }, error: state.insertError }) }) });
    },
    update: (payload: Record<string, unknown>) => { state.updates.push({ table, payload }); return { eq: async () => ({ error: null }) }; },
    then: (resolve: (value: unknown) => void) => resolve(q.head ? { count: state.count } : table === "profiles" ? { data: state.staff } : { data: state.open }),
  };
  return chain;
} }) }));

import { POST } from "../src/app/api/contact/route";

const valid = { name: "Visitor", email: "visitor@example.com", phone: "+91 98765 43210", requestId: "ab927a0d-3560-4be4-8815-27ce986fc2f2" };
function request(body: object) { return new NextRequest("http://localhost:3000/api/contact", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify(body) }); }
const leadInserts = () => state.inserts.filter(item => item.table === "leads");

describe("contact capture", () => {
  beforeEach(() => { Object.assign(state, { dedupe: false, count: 0, byEmail: null, byPhone: null, insertError: null, staff: [], open: [] }); state.inserts.length = 0; state.updates.length = 0; });

  it("rejects invalid contact details before writing", async () => {
    expect((await POST(request({ ...valid, email: "bad" }))).status).toBe(400);
    expect((await POST(request({ ...valid, phone: "" }))).status).toBe(400);
    expect((await POST(request({ ...valid, phone: "12345" }))).status).toBe(400);
    expect(state.inserts).toHaveLength(0);
  });
  it("treats a repeated request ID as a successful retry without a second lead", async () => {
    state.dedupe = true;
    const response = await POST(request(valid));
    expect(response.status).toBe(200); expect((await response.json()).duplicate).toBe(true);
    expect(state.inserts).toHaveLength(0);
  });
  it("saves a new lead and reports storage failure", async () => {
    expect((await POST(request(valid))).status).toBe(200);
    expect(leadInserts()).toHaveLength(1);
    state.insertError = { code: "NETWORK" };
    expect((await POST(request(valid))).status).toBe(503);
  });
  it("limits repeated enquiries from one email", async () => {
    state.count = 5;
    expect((await POST(request(valid))).status).toBe(429);
    expect(state.inserts).toHaveLength(0);
  });
  it("records the source, qualification answers and assigns the least loaded person", async () => {
    state.staff = [{ id: "s1" }, { id: "s2" }]; state.open = [{ assigned_to: "s1" }];
    await POST(request({ ...valid, utm_source: "instagram", moveIn: "Immediately", budget: "not a real option" }));
    expect(leadInserts()[0].payload).toMatchObject({ channel: "Instagram", utm_source: "instagram", move_in: "Immediately", budget: "", assigned_to: "s2" });
    expect(state.inserts.some(item => item.table === "lead_activity")).toBe(true);
  });
  it("adds a repeat enquiry to the existing lead and reopens it if it was lost", async () => {
    state.byEmail = { id: "old", stage: "lost" };
    const response = await POST(request({ ...valid, message: "Still interested" }));
    expect((await response.json()).repeat).toBe(true);
    expect(leadInserts()).toHaveLength(0);
    expect(state.inserts.find(item => item.table === "lead_notes")?.payload.body).toContain("Still interested");
    expect(state.updates.find(item => item.table === "leads")?.payload).toMatchObject({ stage: "new", lost_reason: null });
  });
  it("matches a repeat enquiry by phone number when the email is new", async () => {
    state.byPhone = { id: "old", stage: "contacted" };
    expect((await (await POST(request(valid))).json()).repeat).toBe(true);
    expect(state.updates.find(item => item.table === "leads")?.payload).not.toHaveProperty("stage");
  });
});
