"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type LoginState } from "../actions";
import "@/app/admin/admin.css";

const initialState: LoginState = { message: "" };

export default function ResetPassword() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  return <main className="admin-login"><form action={formAction} className="admin-login-card">
    <p className="label">WORKSPACE ADMIN</p><h1>Reset your password</h1>
    <p>Enter your admin email and we’ll send a link to choose a new password.</p>
    {state.message && <p role="status" className={state.message.startsWith("If this email") ? "admin-success" : "admin-error"}>{state.message}</p>}
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
    <Link className="admin-login-help" href="/login">Back to sign in</Link>
  </form></main>;
}
