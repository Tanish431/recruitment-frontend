"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useActiveRound, useLocations } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Select, Input, EmptyState, Badge, PageLoading } from "@/components/ui";
import type { SlotJudgesResponse, SlotView } from "@/lib/types";

export default function Round3ManagePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const { round, loading: roundLoading } = useActiveRound();
  const roundId = round?.id ?? null;
  const locations = useLocations(roundId);

  const [locationId, setLocationId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(15);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotView[]>([]);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => {
        if (u.role !== "admin") router.replace("/judge/round3");
        else setAuthorized(true);
      })
      .catch(() => router.replace("/"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshSlots() {
    if (!roundId) return;
    try {
      const s = await api.admin.listSlots(roundId);
      setSlots(s);
    } catch (e: any) {
      setError(e.message || "Failed to load slots.");
    }
  }

  useEffect(() => {
    if (!authorized || !roundId) return;
    refreshSlots();
    const t = setInterval(refreshSlots, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, roundId]);

  async function create() {
    if (!roundId || !locationId || !date || !time) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await api.admin.createSlot({
        round_id: roundId,
        location_id: locationId,
        start_time: new Date(`${date}T${time}`).toISOString(),
        duration_min: duration,
        capacity: 1,
      });
      setStatus("Slot created — waiting for 2 judges to join.");
      setDate("");
      setTime("");
      await refreshSlots();
    } catch (e: any) {
      setError(e.message || "Failed to create slot.");
    } finally {
      setBusy(false);
    }
  }

  if (!authorized || roundLoading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;
  if (round.number !== 3) {
    return <EmptyState title="Round 3 isn't active" subtitle="This page is only used while Round 3 is running." />;
  }

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
          <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: 90 }} title="Duration (min)" />
          <Button variant="primary" onClick={create} disabled={!locationId || !date || !time || busy}>
            {busy ? "Creating…" : "Create slot"}
          </Button>
        </div>
        {locations.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            No locations exist for Round 3 yet — add one from Admin → Slots & Schedule with Round 3 selected.
          </p>
        )}
        {status && <p style={{ fontSize: 13, color: "var(--success)", marginTop: 10 }}>{status}</p>}
        {error && <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 10 }}>{error}</p>}
      </Card>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Slots & judge presence</h3>
      {slots.length === 0 ? (
        <EmptyState title="No slots yet" subtitle="Create one above." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slots.map((s) => <SlotPresenceCard key={s.id} slot={s} />)}
        </div>
      )}
    </div>
  );
}

function SlotPresenceCard({ slot }: { slot: SlotView }) {
  const [data, setData] = useState<SlotJudgesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);

  async function load() {
    try {
      setData(await api.admin.slotJudges(slot.id));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load judges.");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot.id]);

  async function markPresent(judgeId: number) {
    setMarkingId(judgeId);
    try {
      await api.admin.markR3JudgePresent(slot.id, judgeId);
    } catch (e: any) {
      setError(e.message || "Failed to mark present.");
    } finally {
      setMarkingId(null);
      await load();
    }
  }

  const joined = data?.co_judges.length ?? 0;
  const needed = data?.judges_needed ?? 2;
  const presentCount = data?.co_judges.filter((j) => j.present).length ?? 0;
  const ready = joined >= needed && presentCount >= needed;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{slot.location_name}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(slot.start_time).toLocaleString()}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge tone="neutral">{slot.filled_count}/{slot.capacity} candidate</Badge>
          {data && (
            <Badge tone={ready ? "success" : "warning"}>
              {ready ? "Ready to score" : `${joined}/${needed} joined · ${presentCount} present`}
            </Badge>
          )}
        </div>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 12, margin: "8px 0 0" }}>{error}</p>}

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {data && data.co_judges.length === 0 ? (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Waiting for judges to join.</span>
        ) : (
          data?.co_judges.map((j) => (
            <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 13 }}>{j.name}</span>
              {j.present ? (
                <Badge tone="success">Present</Badge>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => markPresent(j.id)} disabled={markingId === j.id}>
                  {markingId === j.id ? "Marking…" : "Mark present"}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
