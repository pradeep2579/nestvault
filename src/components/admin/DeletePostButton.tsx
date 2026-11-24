"use client";

import { deletePost } from "@/app/admin/blog/actions";

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  return <form action={deletePost} className="admin-danger-zone"
    onSubmit={event => { if (!window.confirm(`Delete "${title}"? It disappears from the website and cannot be recovered.`)) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} />
    <button className="admin-button admin-button-danger">Delete article</button>
  </form>;
}
