"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import "@/app/admin/admin.css";

export default function AcceptInvite() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { queueMicrotask(() => setError("Supabase is not configured")); return; }
    const auth = createBrowserClient(url, key);
    async function accept() {
      try {
        const params = new URLSearchParams(location.search);
        const hash = new URLSearchParams(location.hash.slice(1));
        let result;
        if (params.get("code")) result = await auth.auth.exchangeCodeForSession(params.get("code")!);
        else if (params.get("token_hash")) result = await auth.auth.verifyOtp({ token_hash: params.get("token_hash")!, type: params.get("type") === "recovery" ? "recovery" : "invite" });
        else if (hash.get("access_token") && hash.get("refresh_token")) result = await auth.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! });
        else throw new Error("Open the invitation or password reset link from your email.");
        if (result.error) throw result.error;
        const { data: { user } } = await auth.auth.getUser();
        if (!user) throw new Error("This link is invalid or expired. Request a new password reset link.");
        history.replaceState(null, "", "/login/invite");
        setReady(true);
      } catch (err) { setError(err instanceof Error ? err.message : "Could not open invitation"); }
    }
    void accept();
  }, []);
  async function finish(e: React.FormEvent) {
    e.preventDefault();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const client = createBrowserClient(url, key);
    const { error } = await client.auth.updateUser({ password });
    if (error) setError(error.message); else { router.replace("/admin"); router.refresh(); }
  }
  return <main className="admin-login"><div className="admin-login-card"><p className="label">WORKSPACE ADMIN</p><h1>Set your password</h1>
    {error && <p role="alert" className="admin-error">{error}</p>}
    {ready ? <form className="admin-form" onSubmit={finish}><label>Choose a password<input type="password" minLength={8} required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label><button>Set password and continue</button></form> : <p>Checking your link…</p>}
  </div></main>;
}
