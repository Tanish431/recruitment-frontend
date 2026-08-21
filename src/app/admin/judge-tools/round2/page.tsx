"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker, useLocations } from "@/components/RoundLocationPicker";
import type { AvailableSlot, ParticipantView } from "@/lib/types";

export default function JudgeRound2Page() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const locations = useLocations(roundId);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [available, setAvailable] = useState<AvailableSlot[]>([]);

  const [claimedSlotId, setClaimedSlotId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<ParticipantView[]>([]);

  useEffect(() => {
    if (roundId) api.judge.availableSlots(roundId).then(setAvailable).catch(() => setAvailable([]));
  }, [roundId]);

  async function claimSlot() {
    if (!roundId || !locationId || !dateTime) return;
    const { id } = await api.judge.claimSlot({
      round_id: roundId,
      location_id: locationId,
      start_time: new Date(dateTime).toISOString(),
    });
    setClaimedSlotId(id);
    loadParticipants(id);
  }

  async function loadParticipants(slotId: number) {
    setParticipants(await api.judge.participants(slotId));
  }

  async function setAttendance(id: number, attendance: "present" | "no_show") {
    await api.judge.setAttendance(id, attendance);
    if (claimedSlotId) loadParticipants(claimedSlotId);
  }

  async function setScore(id: number, score: number, comments: string) {
    await api.judge.setScore(id, score, comments);
    if (claimedSlotId) loadParticipants(claimedSlotId);
  }

  return (
    <div>
      <h1>Judge Tools - Round 2 (Debates)</h1>

      {!claimedSlotId && (
        <>
          <h3>Claim a slot</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <RoundPicker value={roundId} onChange={(id) => setRoundId(id)} />
            <select value={locationId ?? ""} onChange={(e) => setLocationId(Number(e.target.value))} style={{ flex: "1 1 180px" }}>
            <option value="">Location…</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} style={{ flex: "1 1 220px" }} />
            <button onClick={claimSlot} disabled={!roundId || !locationId || !dateTime}>Claim</button>
          </div>

          <h4>Still-open slots (already created, unclaimed)</h4>
          {available.map((s) => (
            <div key={s.id} style={{ padding: 6, borderBottom: "1px solid #eee" }}>
              {s.location_name} · {new Date(s.start_time).toLocaleString()}
              <button
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  setClaimedSlotId(s.id);
                  loadParticipants(s.id);
                }}
              >
                Host this one
              </button>
            </div>
          ))}
        </>
      )}

      {claimedSlotId && (
        <div>
          <h3>Debate roster (slot #{claimedSlotId})</h3>
          {participants.map((p) => (
            <ParticipantRow key={p.id} p={p} onAttendance={setAttendance} onScore={setScore} />
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  p,
  onAttendance,
  onScore,
}: {
  p: ParticipantView;
  onAttendance: (id: number, a: "present" | "no_show") => void;
  onScore: (id: number, score: number, comments: string) => void;
}) {
  const [score, setLocalScore] = useState(p.score ?? 0);
  const [comments, setLocalComments] = useState(p.comments ?? "");

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 10, marginTop: 8 }}>
      <div style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{p.candidate_email} - Team {p.team}</div>

      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <button onClick={() => onAttendance(p.id, "present")} disabled={p.attendance === "present"}>Present</button>
        <button onClick={() => onAttendance(p.id, "no_show")} disabled={p.attendance === "no_show"}>No-show</button>
        <span style={{ color: "#666" }}>({p.attendance})</span>
      </div>

      {p.attendance === "present" && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <input type="number" value={score} onChange={(e) => setLocalScore(Number(e.target.value))} style={{ width: 80 }} />
          <input placeholder="comments" value={comments} onChange={(e) => setLocalComments(e.target.value)} style={{ flex: "1 1 220px", minWidth: 0 }} />
          <button onClick={() => onScore(p.id, score, comments)}>Save</button>
        </div>
      )}
    </div>
  );
}
