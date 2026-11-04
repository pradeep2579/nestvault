import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ existing: false, count: 0, insertError: null as null | { code: string }, inserts: [] as object[] }));
vi.mock("@/lib/supabase", () => ({ db: () => ({ from: () => ({
  select: (_fields: string, options?: { head?: boolean }) => options?.head
    ? { eq: () => ({ gte: async () => ({ count: state.count }) }) }
    : { eq: () => ({ maybeSingle: async () => ({ data: state.existing ? { id: "existing" } : null }) }) },
  insert: async (payload: object) => { state.inserts.push(payload); return { error: state.insertError }; },
}) }) }));

import { POST } from "../src/app/api/contact/route";

const valid = { name: "Visitor", email: "visitor@example.com", requestId: "ab927a0d-3560-4be4-8815-27ce986fc2f2" };
function request(body: object) { return new NextRequest("http://localhost:3000/api/contact", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify(body) }); }

describe("contact capture", () => {
  beforeEach(() => { state.existing = false; state.count = 0; state.insertError = null; state.inserts.length = 0; });
  it("rejects invalid contact details before writing", async () => {
    const response = await POST(request({ ...valid, email: "bad" }));
    expect(response.status).toBe(400); expect(state.inserts).toHaveLength(0);
  });
  it("treats a repeated request ID as a successful retry without a second lead", async () => {
    state.existing = true;
    const response = await POST(request(valid));
    expect(response.status).toBe(200); expect((await response.json()).duplicate).toBe(true);
    expect(state.inserts).toHaveLength(0);
  });
  it("saves a new lead and reports storage failure", async () => {
    expect((await POST(request(valid))).status).toBe(200);
    expect(state.inserts).toHaveLength(1);
    state.insertError = { code: "NETWORK" };
    expect((await POST(request(valid))).status).toBe(503);
  });
  it("limits repeated enquiries from one email", async () => {
    state.count = 5;
    expect((await POST(request(valid))).status).toBe(429);
    expect(state.inserts).toHaveLength(0);
  });
});
