"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { api } from "@/lib/api";
import { useActiveRound, useLocations } from "@/components/RoundLocationPicker";
import { PropertyScoring } from "@/components/judge/PropertyScoring";
import { PageHeader, Card, Button, Select, Badge, EmptyState, PageLoading } from "@/components/ui";
import type { MyClaimedSlot, ParticipantView } from "@/lib/types";

export function Round2View() {
  const { round, loading: roundLoading } = useActiveRound();
  const roundId = round?.id ?? null;
  const locations = useLocations(roundId);

  const [locationId, setLocationId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [myClaims, setMyClaims] = useState<MyClaimedSlot[]>([]);
  const [claimedSlotId, setClaimedSlotId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<ParticipantView[]>([]);

  async function refreshClaims() {
    if (roundId) setMyClaims(await api.judge.myClaimedSlots(roundId));
  }
  useEffect(() => { refreshClaims(); }, [roundId]);

  async function claimSlot() {
    if (!roundId || !locationId || !date || !time) return;
    setClaimError(null);
    setBusy(true);
    try {
      const { id } = await api.judge.claimSlot({
        round_id: roundId,
        location_id: locationId,
        start_time: new Date(`${date}T${time}`).toISOString(),
      });
      setDate("");
      setTime("");
      await refreshClaims();
      openSlot(id);
    } catch (e: any) {
      setClaimError(e.message?.includes("already claimed") ? "That location + time is already taken — pick another." : e.message);
    } finally {
      setBusy(false);
    }
  }

  async function openSlot(slotId: number) {
    setClaimedSlotId(slotId);
    setParticipants(await api.judge.participants(slotId));
  }

  async function setAttendance(id: number, attendance: "present" | "no_show") {
    await api.judge.setAttendance(id, attendance);
    if (claimedSlotId) openSlot(claimedSlotId);
  }
  async function setScore(id: number, score: number, comments: string) {
    await api.judge.setScore(id, score, comments);
    if (claimedSlotId) openSlot(claimedSlotId);
  }


  if (roundLoading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;

  if (claimedSlotId) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setClaimedSlotId(null)}
              style={{
                width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)",
                background: "var(--bg-elevated)", color: "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              title="Back to your slots"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Debate roster</h2>
          </div>
          <Button
            variant="danger"
            onClick={async () => {
              await api.judge.closeSlot(claimedSlotId!);
              setClaimedSlotId(null);
              refreshClaims();
            }}
          >
            <X size={14} /> Close this debate
          </Button>
        </div>

        {participants.length === 0 ? (
          <EmptyState title="Slot isn't filled" subtitle="No candidates have been assigned to this debate yet." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {participants.map((p) => (
              <ParticipantRow key={p.id} p={p} roundId={round.id} onAttendance={setAttendance} onScore={setScore} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Round 2 — Debates" subtitle="Claim a location and time for your debate. First judge to claim it gets it." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Claim a new slot</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Select value={locationId ?? ""} onChange={(e) => setLocationId(Number(e.target.value))}>
            <option value="">Location…</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "9px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ padding: "9px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} />
          <Button variant="primary" onClick={claimSlot} disabled={!locationId || !date || !time || busy}>
            {busy ? "Claiming…" : "Claim this slot"}
          </Button>
        </div>
        {locations.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            No locations exist for this round yet — ask an admin to add one from the Slots page.
          </p>
        )}
        {claimError && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{claimError}</p>}
      </Card>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Your claimed slots</h3>
      {myClaims.length === 0 ? (
        <EmptyState title="No slots claimed yet" subtitle="Claim one above to start scoring a debate." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myClaims.map((s) => (
            <Card key={s.id} style={{ cursor: "pointer" }}>
              <div onClick={() => openSlot(s.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.location_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(s.start_time).toLocaleString()}</div>
                </div>
                <Badge tone="accent">{s.filled_count}/{s.capacity} filled</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  p, roundId, onAttendance, onScore,
}: {
  p: ParticipantView;
  roundId: number;
  onAttendance: (id: number, a: "present" | "no_show") => void;
  onScore: (id: number, score: number, comments: string) => void;
}) {
  const [score, setLocalScore] = useState(p.score && p.score > 0 ? p.score : 3);
  const [comments, setLocalComments] = useState(p.comments ?? "");

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>{p.candidate_name || p.candidate_email}</div>
        <Badge tone="neutral">Team {p.team}</Badge>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <Button size="sm" variant={p.attendance === "present" ? "primary" : "secondary"} onClick={() => onAttendance(p.id, "present")}>Present</Button>
        <Button size="sm" variant={p.attendance === "no_show" ? "danger" : "secondary"} onClick={() => onAttendance(p.id, "no_show")}>No-show</Button>
      </div>
      {p.attendance === "present" && (
        <div style={{ marginTop: 14 }}>
          <PropertyScoring roundId={roundId} kind="participant" targetId={p.id} overall={score} onOverallChange={setLocalScore} />
          <textarea
            value={comments}
            onChange={(e) => setLocalComments(e.target.value)}
            placeholder="Comments"
            rows={2}
            style={{ width: "100%", marginTop: 10, padding: 9, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          />
          <Button size="sm" variant="primary" onClick={() => onScore(p.id, score, comments)} style={{ marginTop: 8 }}>Save</Button>
        </div>
      )}
    </Card>
  );
}
