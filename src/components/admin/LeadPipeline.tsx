"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type PointerEvent } from "react";
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
  const [ghost, setGhost] = useState<{ x: number; y: number; name: string } | null>(null);
  const pointer = useRef<{ id: string; pointerId: number; x: number; y: number; name: string; moved: boolean } | null>(null);
  const removePointerListeners = useRef<(() => void) | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => () => removePointerListeners.current?.(), []);

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

  function stageAt(x: number, y: number): Stage | null {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-pipeline-stage]");
    const stage = element?.dataset.pipelineStage;
    return columns.some(column => column.stage === stage) ? stage as Stage : null;
  }

  function pointerDown(event: PointerEvent<HTMLElement>, lead: LeadCard) {
    if (savingId || pointer.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, select") || (event.pointerType === "touch" && !target.closest(".admin-drag-handle"))) return;
    event.preventDefault();
    pointer.current = { id: lead.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, name: lead.name, moved: false };
    setError("");
    const onMove = (moveEvent: globalThis.PointerEvent) => pointerMove(moveEvent);
    const onUp = (upEvent: globalThis.PointerEvent) => {
      if (upEvent.pointerId === pointer.current?.pointerId) finishPointer(upEvent.clientX, upEvent.clientY);
    };
    const onMouseUp = (upEvent: MouseEvent) => finishPointer(upEvent.clientX, upEvent.clientY);
    const onCancel = () => finishPointer(0, 0, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("blur", onCancel);
    removePointerListeners.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onCancel);
    };
  }

  function pointerMove(event: globalThis.PointerEvent) {
    const current = pointer.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
    current.moved = true;
    setDraggingId(current.id);
    setGhost({ x: event.clientX, y: event.clientY, name: current.name });
    setOverStage(stageAt(event.clientX, event.clientY));
  }

  function finishPointer(x: number, y: number, cancelled = false) {
    const current = pointer.current;
    if (!current) return;
    const target = !cancelled && current.moved ? stageAt(x, y) : null;
    pointer.current = null;
    removePointerListeners.current?.();
    removePointerListeners.current = null;
    setDraggingId(null);
    setOverStage(null);
    setGhost(null);
    if (target) move(current.id, target);
  }

  return <>
    <p className="admin-pipeline-hint">Drag a lead into another stage, or use its stage menu. Open a card for notes, follow-ups, and tours.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-pipeline" aria-label="Lead pipeline">{columns.map(column => <section
      className={`admin-pipeline-column${overStage === column.stage ? " is-drop-target" : ""}`}
      key={column.stage}
      data-pipeline-stage={column.stage}
      aria-label={`${label(column.stage)}: ${column.count} leads`}
    >
      <div className="admin-pipeline-heading"><span className={`admin-status admin-status--${column.stage}`}>{label(column.stage)}</span><strong>{column.count}</strong></div>
      <div className="admin-pipeline-items">{column.leads.map(lead => <article className={`admin-pipeline-lead${draggingId === lead.id ? " is-dragging" : ""}`} key={lead.id}
        onPointerDown={event => pointerDown(event, lead)}>
        <span className="admin-drag-handle" title="Drag to another stage" aria-hidden="true">⋮⋮</span>
        <Link className="admin-pipeline-lead-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link>
        <span>{lead.interest || lead.email || lead.phone || "Offline lead"}</span>
        <small>{lead.follow_up_at ? `Follow up ${date(lead.follow_up_at)}` : lead.tour_at ? `Tour ${date(lead.tour_at)}` : `Added ${date(lead.created_at)}`}</small>
        <label className="admin-pipeline-move-label">Move to
          <select aria-label={`Move ${lead.name} to stage`} value={column.stage} disabled={!!savingId}
            onChange={event => move(lead.id, event.target.value as Stage)}>
            {columns.map(option => <option key={option.stage} value={option.stage}>{label(option.stage)}</option>)}
          </select>
        </label>
      </article>)}{!column.leads.length && <p className="admin-pipeline-empty">Drop a lead here</p>}</div>
      {column.count > visibleLimit && <Link className="admin-link admin-pipeline-more" href={`/admin/leads?stage=${column.stage}`}>View all {column.count} →</Link>}
    </section>)}</div>
    {ghost && <div className="admin-drag-ghost" style={{ left: ghost.x + 14, top: ghost.y + 14 }} aria-hidden="true">{ghost.name}</div>}
  </>;
}
