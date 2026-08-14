"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker } from "@/components/RoundLocationPicker";
import { useCachedResource } from "@/lib/useCachedResource";
import { parseLocalDate } from "@/lib/dates";
import { PageHeader, Card, Button, Badge, Input, EmptyState, PageLoading } from "@/components/ui";
import type { AssignmentBoardView, SlotView, UnassignedCandidate } from "@/lib/types";

const DAYS_PER_PAGE = 6;

export default function AssignmentsPage() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const [roundNumber, setRoundNumber] = useState<number | null>(null);
  const [groupSize, setGroupSize] = useState(6);
  const [status, setStatus] = useState<{ text: string; tone: "success" | "warning" } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayPage, setDayPage] = useState(0);
  const [running, setRunning] = useState(false);

  const { data: assignments, refresh: refreshAssignments } = useCachedResource<AssignmentBoardView[]>(
    `assignments-${roundId}`,
    () => (roundId ? api.admin.listAssignments(roundId) : Promise.resolve([])),
    [roundId],
    []
  );
  const { data: slots, refresh: refreshSlots } = useCachedResource<SlotView[]>(
    `slots-${roundId}`,
    () => (roundId ? api.admin.listSlots(roundId) : Promise.resolve([])),
    [roundId],
    []
  );

  async function refreshAll() {
    await Promise.all([refreshAssignments(), refreshSlots()]);
  }

  async function runAssignment() {
    if (!roundId) return;
    setRunning(true);
    try {
      const r = await api.admin.runAssignment(roundId, groupSize);
      if (r.warnings && r.warnings.length > 0) {
        setStatus({ text: `Placed ${r.slots_filled} slots. ${r.warnings.join(" ")}`, tone: "warning" });
      } else {
        setStatus({ text: `Placed ${r.slots_filled} slots, ${r.unplaced} unplaced.`, tone: "success" });
      }
      refreshAll();
    } finally {
      setRunning(false);
    }
  }

  const dayGroups = useMemo(() => groupByDate(slots, assignments), [slots, assignments]);
  const visibleDays = dayGroups.slice(dayPage * DAYS_PER_PAGE, dayPage * DAYS_PER_PAGE + DAYS_PER_PAGE);
  const selectedDayGroup = dayGroups.find((d) => d.date === selectedDate) ?? null;

  return (
    <div>
      <PageHeader
        title="Assignment Board"
        subtitle="Click a day to view, add, or remove candidates from its slots."
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <RoundPicker value={roundId} onChange={(id, num) => { setRoundId(id); setRoundNumber(num); }} />
            {roundNumber === 2 && (
              <Input
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                style={{ width: 60 }}
                title="Group size"
              />
            )}
            <Button variant="primary" onClick={runAssignment} disabled={!roundId || running}>
              {running ? "Running…" : "Run auto-assignment"}
            </Button>
          </div>
        }
      />

      {status && (
        <Card style={{ marginBottom: "var(--space-5)", borderColor: status.tone === "warning" ? "var(--warning)" : "var(--success)" }}>
          <p style={{ margin: 0, fontSize: 14, color: status.tone === "warning" ? "var(--warning)" : "var(--success)" }}>
            {status.text}
          </p>
        </Card>
      )}

      {!roundId ? (
        <EmptyState title="Select a round" subtitle="Choose a round above to see its schedule." />
      ) : slots.length === 0 ? (
        <EmptyState title="No slots yet" subtitle="Generate a schedule (Round 1/3) or wait for judges to claim slots (Round 2)." />
      ) : (
        <>
          <SectionLabel>Schedule</SectionLabel>
          <DayGrid
            days={visibleDays}
            onSelect={setSelectedDate}
            onPrev={() => setDayPage((p) => Math.max(0, p - 1))}
            onNext={() => setDayPage((p) => p + 1)}
            canPrev={dayPage > 0}
            canNext={(dayPage + 1) * DAYS_PER_PAGE < dayGroups.length}
          />
        </>
      )}

      {selectedDayGroup && roundId && (
        <DayModal
          dayGroup={selectedDayGroup}
          roundId={roundId}
          onClose={() => setSelectedDate(null)}
          onChanged={refreshAll}
        />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--text-muted)", margin: "var(--space-5) 0 var(--space-3)" }}>
      {children}
    </h3>
  );
}

function groupByDate(slots: SlotView[], assignments: AssignmentBoardView[]) {
  const bySlot = new Map<number, AssignmentBoardView[]>();
  for (const a of assignments) {
    if (!bySlot.has(a.slot_id)) bySlot.set(a.slot_id, []);
    bySlot.get(a.slot_id)!.push(a);
  }

  const byDate = new Map<
    string,
    { date: string; slots: SlotView[]; names: string[]; totalCapacity: number; totalFilled: number }
  >();

  for (const s of slots) {
    const date = s.start_time.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, { date, slots: [], names: [], totalCapacity: 0, totalFilled: 0 });
    const g = byDate.get(date)!;
    g.slots.push(s);
    g.totalCapacity += s.capacity;
    g.totalFilled += s.filled_count;
    const occupants = bySlot.get(s.id) ?? [];
    g.names.push(...occupants.map((o) => o.candidate_name || o.candidate_email));
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function DayGrid({
  days, onSelect, onPrev, onNext, canPrev, canNext,
}: {
  days: ReturnType<typeof groupByDate>;
  onSelect: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {days.map((d) => {
          const localDate = parseLocalDate(d.date);
          const fillRatio = d.totalCapacity > 0 ? d.totalFilled / d.totalCapacity : 0;
          return (
            <div
              key={d.date}
              onClick={() => onSelect(d.date)}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                    {localDate.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                    {localDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, background: "var(--bg-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, fillRatio * 100)}%`, background: "var(--accent)", borderRadius: "var(--radius-full)" }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  {d.totalFilled}/{d.totalCapacity} filled · {d.slots.length} slots
                </div>
              </div>

              <div style={{ fontSize: 12.5, marginTop: 10, color: "var(--text)", lineHeight: 1.5 }}>
                {d.names.slice(0, 3).join(", ")}
                {d.names.length > 3 && <span style={{ color: "var(--text-muted)" }}> +{d.names.length - 3} more</span>}
                {d.names.length === 0 && <span style={{ color: "var(--text-faint)" }}>No one placed yet</span>}
              </div>
            </div>
          );
        })}
        {days.length === 0 && <EmptyState title="No days here" />}
      </div>
      {days.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <Button size="sm" variant="secondary" disabled={!canPrev} onClick={onPrev}>← Prev</Button>
          <Button size="sm" variant="secondary" disabled={!canNext} onClick={onNext}>Next →</Button>
        </div>
      )}
    </div>
  );
}

function DayModal({
  dayGroup, roundId, onClose, onChanged,
}: {
  dayGroup: ReturnType<typeof groupByDate>[number];
  roundId: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [assignments, setAssignments] = useState<AssignmentBoardView[]>([]);
  const [unassigned, setUnassigned] = useState<UnassignedCandidate[]>([]);
  const [addingToSlot, setAddingToSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoaded(false);
      setWarning(null);
      const all = await api.admin.listAssignments(roundId);
      const relevant = all.filter((a) => dayGroup.slots.some((s) => s.id === a.slot_id));
      const candidates = await api.admin.listUnassignedCandidates(roundId);
      if (cancelled) return;
      setAssignments(relevant);
      setUnassigned(candidates);
      setLoaded(true);
    }

    void load().catch(() => {
      if (!cancelled) {
        setWarning("Failed to load day details.");
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [roundId, dayGroup]);

  async function remove(assignmentId: number) {
    await api.admin.unassignCandidate(assignmentId);
    setLoaded(false);
    setWarning(null);
    const all = await api.admin.listAssignments(roundId);
    setAssignments(all.filter((a) => dayGroup.slots.some((s) => s.id === a.slot_id)));
    setUnassigned(await api.admin.listUnassignedCandidates(roundId));
    setLoaded(true);
    onChanged();
  }

  async function add(slotId: number, candidateId: number) {
    try {
      await api.admin.addCandidateToSlot(slotId, candidateId);
      setAddingToSlot(null);
      setSearch("");
      setWarning(null);
      setLoaded(false);
      const all = await api.admin.listAssignments(roundId);
      setAssignments(all.filter((a) => dayGroup.slots.some((s) => s.id === a.slot_id)));
      setUnassigned(await api.admin.listUnassignedCandidates(roundId));
      setLoaded(true);
      onChanged();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to add candidate.";
      setWarning(message.toLowerCase().includes("full") ? "Slot is full." : message);
    }
  }

  const filtered = unassigned.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  const localDate = parseLocalDate(dayGroup.date);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.45)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Card style={{ width: 620, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {localDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h2>
          <Button size="sm" variant="ghost" onClick={onClose}>✕ Close</Button>
        </div>

        {warning && (
          <div style={{ background: "var(--warning-soft)", color: "var(--warning)", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 12 }}>
            {warning}
          </div>
        )}

        {!loaded ? (
          <PageLoading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dayGroup.slots.map((slot) => {
              const occupants = assignments.filter((a) => a.slot_id === slot.id);
              const full = slot.filled_count >= slot.capacity;
              return (
                <Card key={slot.id} style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      <strong style={{ color: "var(--text)" }}>{new Date(slot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                      {" · "}{slot.location_name}
                    </div>
                    <Badge tone={full ? "neutral" : "accent"}>{occupants.length}/{slot.capacity}</Badge>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {occupants.map((o) => (
                      <div key={o.assignment_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                        <span>{o.candidate_name || o.candidate_email}{o.team ? <Badge tone="neutral">{o.team}</Badge> : null}</span>
                        <Button size="sm" variant="danger" onClick={() => remove(o.assignment_id)}>Remove</Button>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {full ? (
                      <p style={{ fontSize: 12, color: "var(--text-faint)", margin: 0 }}>Limit filled</p>
                    ) : addingToSlot === slot.id ? (
                      <div>
                        <Input
                          placeholder="search name or email…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          style={{ marginBottom: 6 }}
                          autoFocus
                        />
                        <div style={{ maxHeight: 140, overflowY: "auto" }}>
                          {filtered.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => add(slot.id, c.id)}
                              style={{ padding: "6px 4px", cursor: "pointer", fontSize: 13, borderRadius: 4 }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                            >
                              {c.name || c.email} <span style={{ color: "var(--text-muted)" }}>{c.email}</span>
                            </div>
                          ))}
                          {filtered.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 12 }}>No matches.</p>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { setAddingToSlot(null); setSearch(""); }}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setAddingToSlot(slot.id)}>+ Add candidate</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
