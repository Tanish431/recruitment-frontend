"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useActiveRound, useLocations } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Select, Input, EmptyState, Badge } from "@/components/ui";
import type { SlotJudgesResponse, SlotView } from "@/lib/types";

export default function Round3ManagePage() {
  const { round } = useActiveRound();
  const roundId = round?.id ?? null;
  const locations = useLocations(roundId);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(15);
  const [status, setStatus] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotView[]>([]);

  async function refresh() {
    if (roundId) setSlots(await api.admin.listSlots(roundId));
  }
  useEffect(() => { refresh(); }, [roundId]);

  async function create() {
    if (!roundId || !locationId || !date || !time) return;
    await api.admin.createSlot({
      round_id: roundId, location_id: locationId,
      start_time: new Date(`${date}T${time}`).toISOString(),
      duration_min: duration, capacity: 1,
    });
    setStatus("Slot created - waiting for 2 judges to join.");
    setDate(""); setTime("");
    refresh();
  }

  if (!round) return <EmptyState title="No round active" />;

  return (
    <div>
      <PageHeader title="Round 3 Slots" subtitle="Create interview slots, then confirm both observing judges are present before scoring." />
      <Card style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Select value={locationId ?? ""} onChange={(e) => setLocationId(Number(e.target.value))}>
            <option value="">Location…</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 160 }} />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 130 }} />
          <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: 90 }} />
          <Button variant="primary" onClick={create} disabled={!locationId || !date || !time}>Create slot</Button>
        </div>
        {status && <p style={{ fontSize: 13, color: "var(--success)", marginTop: 10 }}>{status}</p>}
      </Card>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Slots & judge presence</h3>
      {slots.map((s) => (
        <SlotPresenceCard key={s.id} slot={s} />
      ))}
    </div>
  );
}

function SlotPresenceCard({ slot }: { slot: SlotView }) {
  const [data, setData] = useState<SlotJudgesResponse | null>(null);

  async function load() {
    setData(await api.admin.slotJudges(slot.id));
  }
  useEffect(() => { load(); }, [slot.id]);

  if (!data) return null;

  return (
    <Card style={{ marginBottom: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{slot.location_name} · {new Date(slot.start_time).toLocaleString()}</div>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        {data.co_judges.length === 0 ? (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Waiting for judges to join.</span>
        ) : (
          data.co_judges.map((j) => (
            <PresenceRow key={j.id} slotId={slot.id} judge={j} onMarked={load} />
          ))
        )}
      </div>
    </Card>
  );
}

function PresenceRow({ slotId, judge, onMarked }: { slotId: number; judge: { id: number; name: string }; onMarked: () => void }) {
  // presence flag isn't in SlotJudgesResponse yet - using a simple mark button;
  // extend SlotJudges to also return host_marked_present per co-judge if you want a live checkmark here.
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13 }}>{judge.name}</span>
      <Button
        size="sm"
        variant="primary"
        onClick={async () => {
          await api.admin.markR3JudgePresent(slotId, judge.id);
          onMarked();
        }}
      >
        Mark present
      </Button>
    </div>
  );
}
