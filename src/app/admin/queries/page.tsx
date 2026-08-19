"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Card, Button, Select, Badge, EmptyState } from "@/components/ui";
import type { PendingQueryView, OpenSlotOption, OtherAssignmentOption } from "@/lib/types";

export default function QueriesPage() {
  const [queries, setQueries] = useState<PendingQueryView[]>([]);

  async function refresh() {
    setQueries(await api.admin.listPendingQueries());
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <PageHeader title="Pending Queries" subtitle="Resolve by swapping with another candidate, moving to an open slot, or dismissing." />

      {queries.length === 0 ? (
        <EmptyState title="No pending queries" subtitle="You're all caught up." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {queries.map((q) => <QueryRow key={q.query_id} q={q} onResolved={refresh} />)}
        </div>
      )}
    </div>
  );
}

function QueryRow({ q, onResolved }: { q: PendingQueryView; onResolved: () => void }) {
  const [mode, setMode] = useState<"swap" | "reassign" | null>(null);
  const [slots, setSlots] = useState<OpenSlotOption[]>([]);
  const [others, setOthers] = useState<OtherAssignmentOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "reassign") api.admin.openSlotsForRound(q.round_id).then(setSlots).catch((e) => setFetchError(String(e.message || e)));
    if (mode === "swap") api.admin.otherAssignmentsForRound(q.round_id, q.assignment_id).then(setOthers).catch((e) => setFetchError(String(e.message || e)));
  }, [mode]);

  async function resolve() {
    if (mode === "swap" && selectedAssignment) {
      await api.admin.resolveQuery(q.query_id, { resolution: "swap", swap_with_assignment_id: selectedAssignment });
    } else if (mode === "reassign" && selectedSlot) {
      await api.admin.resolveQuery(q.query_id, { resolution: "reassign", new_slot_id: selectedSlot });
    } else return;
    onResolved();
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong>{q.candidate_name || q.candidate_email}</strong>
            <Badge tone="accent">R{q.round_number}</Badge>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {q.location_name} · {new Date(q.start_time).toLocaleString()}
          </div>
        </div>
      </div>
      <p style={{ margin: "10px 0", fontSize: 14, color: "var(--text)" }}>{q.reason}</p>

      {!mode && (
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="secondary" onClick={() => setMode("swap")}>Swap with someone</Button>
          <Button size="sm" variant="secondary" onClick={() => setMode("reassign")}>Move to open slot</Button>
          <Button size="sm" variant="danger" onClick={() => api.admin.cancelQuery(q.query_id).then(onResolved)}>Dismiss (no change)</Button>
        </div>
      )}

      {fetchError && <p style={{ color: "var(--danger)", fontSize: 13 }}>{fetchError}</p>}

      {mode === "swap" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select value={selectedAssignment ?? ""} onChange={(e) => setSelectedAssignment(Number(e.target.value))} style={{ flex: 1 }}>
            <option value="">Select candidate to swap with…</option>
            {others.map((o) => (
              <option key={o.assignment_id} value={o.assignment_id}>
                {o.candidate_name || o.candidate_email} - {o.location_name}, {new Date(o.start_time).toLocaleString()}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="primary" onClick={resolve} disabled={!selectedAssignment}>Confirm swap</Button>
          <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
        </div>
      )}

      {mode === "reassign" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select value={selectedSlot ?? ""} onChange={(e) => setSelectedSlot(Number(e.target.value))} style={{ flex: 1 }}>
            <option value="">Select open slot…</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.location_name} - {new Date(s.start_time).toLocaleString()} ({s.free_capacity} free)
              </option>
            ))}
          </Select>
          <Button size="sm" variant="primary" onClick={resolve} disabled={!selectedSlot}>Confirm move</Button>
          <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
        </div>
      )}
    </Card>
  );
}
