"use client";

import { mergeLead } from "@/app/admin/leads/actions";

export default function MergeLeadButton({ id, duplicateId, name }: { id: string; duplicateId: string; name: string }) {
  return <form action={mergeLead}
    onSubmit={event => { if (!window.confirm(`Merge ${name} into this lead? Their notes and history move here, and the duplicate is removed.`)) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="duplicate_id" value={duplicateId} />
    <button className="admin-button admin-button-outline">Merge into this lead</button>
  </form>;
}
