"use client";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

export default function RichEditor({ initial }: { initial: string }) {
  const [error, setError] = useState("");
  const [html, setHtml] = useState(initial);
  const editor = useEditor({ extensions: [StarterKit.configure({ link: false }), Image, Link.configure({ openOnClick: false })],
    content: initial, immediatelyRender: false, onUpdate: ({ editor }) => setHtml(editor.getHTML()) });
  const upload = async (file: File) => {
    setError("");
    const alt = window.prompt("Describe this image for accessibility and SEO", "")?.trim();
    if (!alt) { setError("Image alt text is required"); return; }
    const body = new FormData(); body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Upload failed"); return; }
    editor?.chain().focus().setImage({ src: result.url, alt }).run();
  };
  return <div><input type="hidden" name="body_html" value={html} readOnly />
    <div className="editor-toolbar">
      <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
      <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>Heading</button>
      <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>List</button>
      <button type="button" onClick={() => { const href = window.prompt("Link URL", "https://"); if (href) editor?.chain().focus().setLink({ href }).run(); }}>Link</button>
      <label className="admin-button" style={{ cursor: "pointer" }}>Insert image<input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) void upload(e.target.files[0]); }} /></label>
    </div><EditorContent editor={editor} className="editor-content" />{error && <p role="alert" className="admin-error">{error}</p>}</div>;
}
