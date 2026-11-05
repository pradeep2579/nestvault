"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { message: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  return <main className="admin-login"><form action={formAction} className="admin-login-card">
    <div className="admin-login-brand"><Image src="/images/logo-icon.png" alt="" width={50} height={42} /><span>Nest Vault<small>WORKSPACE ADMIN</small></span></div><p className="label">YOUR WORKSPACE</p><h1>Welcome back.</h1>
    {state.message && <p role="alert" className="admin-error">{state.message}</p>}
    <label>Email<input name="email" type="email" required autoComplete="username" /></label>
    <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
    <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    <Link className="admin-login-help" href="/login/reset">Forgot your password?</Link>
  </form></main>;
}
