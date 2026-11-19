"use client";

import { deleteLead } from "@/app/admin/leads/actions";

export default function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  return <form action={deleteLead} className="admin-danger-zone"
    onSubmit={event => { if (!window.confirm(`Delete ${name}? This also removes their notes and cannot be undone.`)) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} />
    <button className="admin-button admin-button-danger">Delete lead</button>
  </form>;
}
