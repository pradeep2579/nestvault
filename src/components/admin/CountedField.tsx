"use client";

import { useState } from "react";

// A text field that shows how many characters it holds against the range search engines like.
export default function CountedField({ name, label, defaultValue = "", min, max, textarea = false, required = false, placeholder }: {
  name: string; label: string; defaultValue?: string; min: number; max: number; textarea?: boolean; required?: boolean; placeholder?: string }) {
  const [length, setLength] = useState(defaultValue.length);
  const ok = length >= min && length <= max;
  const props = { name, defaultValue, required, placeholder, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLength(event.target.value.length) };
  return <label>{label}{textarea ? <textarea {...props} /> : <input {...props} />}
    <small style={{ color: length === 0 ? "var(--muted)" : ok ? "#217357" : "#8f3238", fontWeight: 600 }}>{length} characters · aim for {min}-{max}{length > 0 && !ok ? (length < min ? " (a bit short)" : " (too long)") : ""}</small></label>;
}
