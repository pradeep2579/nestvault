"use client";

import Link from "next/link";
import { useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import type { Stage } from "@/lib/content";
import { moveLeadStage } from "@/app/admin/leads/actions";

type LeadCard = { id: string; name: string; email: string; phone: string | null; interest: string | null;
  created_at: string; follow_up_at: string | null; tour_at: string | null };
export type PipelineColumn = { stage: Stage; count: number; leads: LeadCard[] };

const visibleLimit = 100;
const label = (stage: Stage) => stage.replaceAll("_", " ");
const date = (value: string) => new Date(value).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

export default function LeadPipeline({ initialColumns }: { initialColumns: PipelineColumn[] }) {
  const router = useRouter();
  const [columns, setColumns] = useState(initialColumns);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function move(id: string, target: Stage) {
    if (savingId) return;
    const source = columns.find(column => column.leads.some(lead => lead.id === id));
    const lead = source?.leads.find(item => item.id === id);
    if (!source || !lead || source.stage === target) return;
    const before = columns;
    setError("");
    setSavingId(id);
    setColumns(columns.map(column => {
      if (column.stage === source.stage) return { ...column, count: column.count - 1, leads: column.leads.filter(item => item.id !== id) };
      if (column.stage === target) return { ...column, count: column.count + 1, leads: [lead, ...column.leads].slice(0, visibleLimit) };
      return column;
    }));
    startTransition(async () => {
      try { await moveLeadStage(id, target); router.refresh(); }
      catch (cause) {
        setColumns(before);
        setError(cause instanceof Error ? cause.message : "Could not move the lead. Please try again.");
      } finally { setSavingId(null); }
    });
  }

  function dragStart(event: DragEvent<HTMLElement>, id: string) {
    if (savingId) { event.preventDefault(); return; }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
    setError("");
  }

  function drop(event: DragEvent<HTMLElement>, target: Stage) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setOverStage(null);
    if (id && id === draggingId) move(id, target);
  }

  return <>
    <p className="admin-pipeline-hint">Drag a lead into another stage, or use its stage menu. Open a card for notes, follow-ups, and tours.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-pipeline" aria-label="Lead pipeline">{columns.map(column => <section
      className={`admin-pipeline-column${overStage === column.stage ? " is-drop-target" : ""}`}
      key={column.stage}
      onDragOver={event => { if (draggingId) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOverStage(column.stage); } }}
      onDrop={event => drop(event, column.stage)}
      aria-label={`${label(column.stage)}: ${column.count} leads`}
    >
      <div className="admin-pipeline-heading"><span className={`admin-status admin-status--${column.stage}`}>{label(column.stage)}</span><strong>{column.count}</strong></div>
      <div className="admin-pipeline-items">{column.leads.map(lead => <article className={`admin-pipeline-lead${draggingId === lead.id ? " is-dragging" : ""}`} key={lead.id}
        draggable={!savingId} onDragStart={event => dragStart(event, lead.id)} onDragEnd={() => { setDraggingId(null); setOverStage(null); }}>
        <Link className="admin-pipeline-lead-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link>
        <span>{lead.interest || lead.email || lead.phone || "Offline lead"}</span>
        <small>{lead.follow_up_at ? `Follow up ${date(lead.follow_up_at)}` : lead.tour_at ? `Tour ${date(lead.tour_at)}` : `Added ${date(lead.created_at)}`}</small>
        <label className="admin-pipeline-move-label">Move to
          <select aria-label={`Move ${lead.name} to stage`} value={column.stage} disabled={!!savingId}
            onDragStart={event => event.preventDefault()}
            onChange={event => move(lead.id, event.target.value as Stage)}>
            {columns.map(option => <option key={option.stage} value={option.stage}>{label(option.stage)}</option>)}
          </select>
        </label>
      </article>)}{!column.leads.length && <p className="admin-pipeline-empty">Drop a lead here</p>}</div>
      {column.count > visibleLimit && <Link className="admin-link admin-pipeline-more" href={`/admin/leads?stage=${column.stage}`}>View all {column.count} →</Link>}
    </section>)}</div>
  </>;
}
