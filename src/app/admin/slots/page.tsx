"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker, useLocations } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Input, Select, Table, Thead, Th, Td, EmptyState } from "@/components/ui";
import type { GenerateScheduleResult, Location, SlotView } from "@/lib/types";

export default function SlotsPage() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const [roundNumber, setRoundNumber] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationsOverride, setLocationsOverride] = useState<Location[] | null>(null);
  const locations = useLocations(roundId);
  const effectiveLocations = locationsOverride ?? locations;

  const [newLocationName, setNewLocationName] = useState("");
  const [round, setRound] = useState<{ id: number; slot_creation_open: boolean } | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekdayStart, setWeekdayStart] = useState("18:00");
  const [weekdayEnd, setWeekdayEnd] = useState("20:00");
  const [weekdayBreakStart, setWeekdayBreakStart] = useState("");
  const [weekdayBreakEnd, setWeekdayBreakEnd] = useState("");
  const [weekendStart, setWeekendStart] = useState("11:00");
  const [weekendEnd, setWeekendEnd] = useState("17:00");
  const [breakStart, setBreakStart] = useState("12:00");
  const [breakEnd, setBreakEnd] = useState("13:00");
  const [durationMin, setDurationMin] = useState(15);
  const [capacity, setCapacity] = useState(1);

  const [result, setResult] = useState<GenerateScheduleResult | null>(null);
  const [slots, setSlots] = useState<SlotView[]>([]);
  const [busy, setBusy] = useState(false);

  async function addLocation() {
    if (!roundId || !newLocationName) return;
    await api.admin.createLocation(roundId, newLocationName);
    setNewLocationName("");
    setLocationsOverride(await api.admin.listLocations(roundId));
  }

  async function toggleSlotCreation(open: boolean) {
    if (!roundId) return;
    await api.admin.toggleSlotCreation(roundId, open);
    setRound((r) => (r ? { ...r, slot_creation_open: open } : r));
  }

  async function generate() {
    if (!roundId || !locationId) return;
    setBusy(true);
    try {
      const r = await api.admin.generateSchedule({
        round_id: roundId,
        location_id: locationId,
        start_date: startDate,
        end_date: endDate,
        weekday: { start_time: weekdayStart, end_time: weekdayEnd, break_start: weekdayBreakStart || undefined, break_end: weekdayBreakEnd || undefined },
        weekend: { start_time: weekendStart, end_time: weekendEnd, break_start: breakStart || undefined, break_end: breakEnd || undefined },
        duration_min: durationMin,
        capacity,
      });
      setResult(r);
      refreshSlots();
    } finally {
      setBusy(false);
    }
  }

  async function refreshSlots() {
    if (!roundId) return;
    setSlots(await api.admin.listSlots(roundId));
  }

  return (
    <div>
      <PageHeader title="Slots & Schedule" subtitle="Generate the interview schedule, or view judge-claimed Round 2 debate slots." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <RoundPicker value={roundId} onChange={(id, num) => { setRoundId(id); setRoundNumber(num); setLocationId(null); setLocationsOverride(null); }} />
          <Button size="sm" variant="secondary" onClick={refreshSlots} disabled={!roundId}>Refresh list</Button>
          <div style={{ flex: 1 }} />
          <Input placeholder="new location name" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} style={{ width: 180 }} />
          <Button size="sm" variant="secondary" onClick={addLocation} disabled={!roundId || !newLocationName}>Add location</Button>
        </div>

        {round && roundNumber === 2 && (
          <div style={{ marginTop: 12, padding: 10, background: "var(--accent-soft)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13 }}>Judge slot claiming is <strong>{round.slot_creation_open ? "OPEN" : "CLOSED"}</strong></span>
            <Button size="sm" variant="secondary" onClick={() => toggleSlotCreation(!round.slot_creation_open)}>
              {round.slot_creation_open ? "Close it" : "Open it"}
            </Button>
          </div>
        )}
      </Card>

      {roundNumber === 1 || roundNumber === 3 ? (
        <Card style={{ marginBottom: "var(--space-5)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Generate schedule</h3>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 10, alignItems: "center", maxWidth: 560 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Location</label>
            <Select value={locationId ?? ""} onChange={(e) => setLocationId(Number(e.target.value))} style={{ gridColumn: "span 2" }}>
              <option value="">Select location…</option>
              {effectiveLocations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Date range</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Weekday hours</label>
            <Input type="time" value={weekdayStart} onChange={(e) => setWeekdayStart(e.target.value)} />
            <Input type="time" value={weekdayEnd} onChange={(e) => setWeekdayEnd(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Weekday break</label>
            <Input type="time" value={weekdayBreakStart} onChange={(e) => setWeekdayBreakStart(e.target.value)} />
            <Input type="time" value={weekdayBreakEnd} onChange={(e) => setWeekdayBreakEnd(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Weekend hours</label>
            <Input type="time" value={weekendStart} onChange={(e) => setWeekendStart(e.target.value)} />
            <Input type="time" value={weekendEnd} onChange={(e) => setWeekendEnd(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Weekend break</label>
            <Input type="time" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} />
            <Input type="time" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} />

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Duration (min)</label>
            <Input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
            <span />

            <label style={{ fontSize: 13, color: "var(--text-muted)" }}>Capacity / slot</label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            <span />


          </div>
          <Button variant="primary" onClick={generate} disabled={!roundId || !locationId || busy} style={{ marginTop: 16 }}>
            {busy ? "Generating…" : "Generate"}
          </Button>
        </Card>
      ) : roundNumber === 2 ? (
        <Card style={{ marginBottom: "var(--space-5)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Round 2 slots are created by judges claiming their own timing. This view is read-only -
            use the Assignment Board to move, swap, or remove candidates.
          </p>
        </Card>
      ) : null}

      {result && (
        <Card style={{ marginBottom: "var(--space-5)", background: "var(--bg-subtle)" }}>
          <p style={{ margin: 0, fontSize: 13 }}>Required capacity: <strong>{result.required_capacity}</strong></p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>Slots created: <strong>{result.slots_created}</strong> across {result.days.join(", ") || "-"}</p>
        </Card>
      )}

      {slots.length === 0 ? (
        <EmptyState title="No slots yet" subtitle="Generate a schedule or refresh the list once slots exist." />
      ) : (
        <Table>
          <Thead>
            <Th>ID</Th><Th>Location</Th><Th>Start</Th><Th>Duration</Th><Th>Filled</Th><Th>Actions</Th>
          </Thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id}>
                <Td muted>{s.id}</Td>
                <Td>{s.location_name}</Td>
                <Td>{new Date(s.start_time).toLocaleString()}</Td>
                <Td>{s.duration_min}m</Td>
                <Td><CapacityCell slot={s} onUpdated={refreshSlots} /></Td>
                <Td><Button size="sm" variant="danger" onClick={() => api.admin.deleteSlot(s.id).then(refreshSlots)}>Delete</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function CapacityCell({ slot, onUpdated }: { slot: SlotView; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(slot.capacity);

  if (!editing) {
    return (
      <span onClick={() => setEditing(true)} style={{ cursor: "pointer" }} title="Click to edit">
        {slot.filled_count}/{slot.capacity} <span style={{ opacity: 0.5 }}>✎</span>
      </span>
    );
  }

  return (
    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <input
        type="number"
        value={value}
        min={slot.filled_count}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: 50, padding: 4, borderRadius: 4, border: "1px solid var(--border)" }}
      />
      <Button size="sm" variant="primary" onClick={async () => { await api.admin.updateSlotCapacity(slot.id, value); setEditing(false); onUpdated(); }}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>✕</Button>
    </span>
  );
}
