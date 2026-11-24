"use client";

import { useFormStatus } from "react-dom";

// Disables itself while the form is saving so a double click cannot send the same change twice.
export default function SubmitButton({ children, pendingLabel = "Saving…", className, name, value }: {
  children: React.ReactNode; pendingLabel?: string; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} name={name} value={value} disabled={pending} aria-busy={pending}>{pending ? pendingLabel : children}</button>;
}
