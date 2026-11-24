import { requirePageActor } from "@/lib/admin-page";
import { changePassword } from "./actions";
import SubmitButton from "@/components/admin/SubmitButton";

type Props = { searchParams: Promise<{ saved?: string; error?: string }> };
const errors: Record<string, string> = { short: "Use at least 10 characters for the new password.", match: "The two new passwords do not match.", same: "Choose a password you have not used just now.",
  current: "The current password is not correct.", update: "The password could not be changed. Try again." };

export default async function Account({ searchParams }: Props) {
  const current = await requirePageActor();
  const query = await searchParams;
  return <><div className="admin-page-heading"><p className="admin-eyebrow">YOUR ACCOUNT</p><h1>Account</h1><p>Signed in as {current.email} · {current.role}.</p></div>
    {query.saved && <p className="admin-success" role="status">Password changed.</p>}
    {query.error && <p className="admin-error" role="alert">{errors[query.error] || "Something went wrong."}</p>}
    <section className="admin-card" style={{ maxWidth: 560 }}><h2>Change password</h2><form action={changePassword} className="admin-form">
      <label>Current password<input name="current" type="password" required autoComplete="current-password" /></label>
      <label>New password<input name="next" type="password" required minLength={10} autoComplete="new-password" /></label>
      <label>Confirm new password<input name="confirm" type="password" required minLength={10} autoComplete="new-password" /></label>
      <p className="crm-hint">At least 10 characters. A long phrase is stronger than a short complicated password.</p>
      <SubmitButton pendingLabel="Changing…">Change password</SubmitButton></form></section></>;
}
