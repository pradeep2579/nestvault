import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { db } from "@/lib/supabase";

const scopes = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";
const redirectUri = () => new URL("/api/admin/google/callback", process.env.NEXT_PUBLIC_SITE_URL || "https://nestvault.in").toString();

function encryptionKey() {
  const key = Buffer.from(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || "", "base64");
  if (key.length !== 32) throw new Error("Google token encryption key must be 32 bytes, base64 encoded");
  return key;
}

export function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const output = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), output]).toString("base64");
}

export function decrypt(value: string) {
  const input = Buffer.from(value, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), input.subarray(0,12));
  decipher.setAuthTag(input.subarray(12,28));
  return Buffer.concat([decipher.update(input.subarray(28)), decipher.final()]).toString("utf8");
}

export function googleAuthorizeUrl(state: string) {
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID || "", redirect_uri: redirectUri(),
    response_type: "code", scope: scopes, access_type: "offline", prompt: "consent", state });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID || "", client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri(), grant_type: "authorization_code" }) });
  if (!response.ok) throw new Error("Google authorization failed");
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number }>;
}

export async function googleToken() {
  const { data } = await db().from("integrations").select("*").eq("name", "google").maybeSingle();
  if (!data) throw new Error("Connect Google in Analytics first");
  if (data.expires_at && new Date(data.expires_at).getTime() > Date.now() + 60_000) return { token: decrypt(data.access_token_encrypted), settings: data };
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ refresh_token: decrypt(data.refresh_token_encrypted), client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "", grant_type: "refresh_token" }) });
  if (!response.ok) throw new Error("Google connection expired. Reconnect it.");
  const renewed = await response.json() as { access_token: string; expires_in: number };
  const expires = new Date(Date.now() + renewed.expires_in * 1000).toISOString();
  await db().from("integrations").update({ access_token_encrypted: encrypt(renewed.access_token), expires_at: expires }).eq("name", "google");
  return { token: renewed.access_token, settings: data };
}

export async function googlePost(url: string, token: string, body: object) {
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), cache: "no-store" });
  if (!response.ok) throw new Error(`Google reporting request failed (${response.status})`);
  return response.json();
}
