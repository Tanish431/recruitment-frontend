"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useActiveRound, useLocations } from "@/components/RoundLocationPicker";
import type { MyClaimedSlot, ParticipantView } from "@/lib/types";

export function Round2View() {
  const { round } = useActiveRound();
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
      setClaimError(e.message?.includes("already claimed") ? "That location + time is already taken - pick another." : "Failed to claim slot.");
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

  if (!round) return <p>No round active.</p>;

  if (claimedSlotId) {
    return (
      <div>
        <button onClick={() => setClaimedSlotId(null)}>← Back</button>
        <h3 style={{ marginTop: 12 }}>Debate roster</h3>
        {participants.map((p) => (
          <ParticipantRow key={p.id} p={p} onAttendance={setAttendance} onScore={setScore} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1>Judge Tools - Round 2 (Debates)</h1>

      <h3>Claim a new slot</h3>
      <p style={{ fontSize: 13, color: "#666" }}>
        Pick a location, date, and time for your debate. First judge to claim a given location+time gets it.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <select value={locationId ?? ""} onChange={(e) => setLocationId(Number(e.target.value))}>
          <option value="">Location…</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button onClick={claimSlot} disabled={!locationId || !date || !time || busy}>
          {busy ? "Claiming…" : "Claim this slot"}
        </button>
      </div>
      {claimError && <p style={{ color: "crimson" }}>{claimError}</p>}

      <h3 style={{ marginTop: 24 }}>Your claimed slots</h3>
      {myClaims.map((s) => (
        <div key={s.id} onClick={() => openSlot(s.id)} style={{ padding: 8, borderBottom: "1px solid #eee", cursor: "pointer" }}>
          {s.location_name} · {new Date(s.start_time).toLocaleString()} · {s.filled_count}/{s.capacity} filled
        </div>
      ))}
      {myClaims.length === 0 && <p style={{ color: "#888" }}>You havent claimed any slots yet.</p>}
    </div>
  );
}

function ParticipantRow({
  p, onAttendance, onScore,
}: {
  p: ParticipantView;
  onAttendance: (id: number, a: "present" | "no_show") => void;
  onScore: (id: number, score: number, comments: string) => void;
}) {
  const [score, setLocalScore] = useState(p.score ?? 0);
  const [comments, setLocalComments] = useState(p.comments ?? "");

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 10, marginTop: 8 }}>
      <div style={{ fontWeight: 600 }}>{p.candidate_name || p.candidate_email} - Team {p.team}</div>
      <div style={{ marginTop: 6 }}>
        <button onClick={() => onAttendance(p.id, "present")} disabled={p.attendance === "present"}>Present</button>
        <button onClick={() => onAttendance(p.id, "no_show")} disabled={p.attendance === "no_show"} style={{ marginLeft: 6 }}>No-show</button>
        <span style={{ marginLeft: 8, color: "#666" }}>({p.attendance})</span>
      </div>
      {p.attendance === "present" && (
        <div style={{ marginTop: 8 }}>
          <input type="number" value={score} onChange={(e) => setLocalScore(Number(e.target.value))} style={{ width: 80 }} />
          <input placeholder="comments" value={comments} onChange={(e) => setLocalComments(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
          <button onClick={() => onScore(p.id, score, comments)} style={{ marginLeft: 8 }}>Save</button>
        </div>
      )}
    </div>
  );
}
