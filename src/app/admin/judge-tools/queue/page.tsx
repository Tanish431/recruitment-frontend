/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker } from "@/components/RoundLocationPicker";
import type { QueueItem } from "@/lib/types";

export default function JudgeQueuePage() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [active, setActive] = useState<QueueItem | null>(null);
  const [score, setScore] = useState(0);
  const [speakerNotes, setSpeakerNotes] = useState("");
  const [finalNotes, setFinalNotes] = useState("");
  const [coJudgeName, setCoJudgeName] = useState("");
  const [coJudgeId, setCoJudgeId] = useState<number | null>(null);
  const [motion, setMotion] = useState("Motion 1");

  const refresh = useCallback(async () => {
    if (roundId) setQueue(await api.judge.queue(roundId));
  }, [roundId]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => { void refresh(); }, 5000); // live-ish polling
    return () => clearInterval(t);
  }, [refresh]);

  async function claim(item: QueueItem) {
    await api.judge.claim(item.evaluation_id);
    setActive(item);
    setScore(0);
    setSpeakerNotes("");
    setFinalNotes("");
    setCoJudgeName("");
    refresh();
  }

  async function submit() {
    if (!active) return;
    await api.judge.submit(
      active.evaluation_id,
      score,
      speakerNotes,
      finalNotes,
      coJudgeId,
      motion,
    );
    setActive(null);
    refresh();
  }

  async function skip() {
    if (!active) return;
    await api.judge.skip(active.evaluation_id);
    setActive(null);
    refresh();
  }

  return (
    <div>
      <h1>Judge Queue - Round 1 / 3</h1>
      <div style={{ margin: "16px 0" }}>
        <RoundPicker value={roundId} onChange={(id) => setRoundId(id)} />
      </div>

      {active && (
        <div style={{ border: "2px solid #333", borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <h3 style={{ overflowWrap: "anywhere" }}>Interviewing: {active.candidate_email}</h3>
          <label>Score</label>
          <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} style={{ display: "block", marginBottom: 8, width: "100%" }} />
          <label>Motion</label>
          <select value={motion} onChange={(e) => setMotion(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8 }}>
            <option>Motion 1</option>
            <option>Motion 2</option>
            <option>Motion 3</option>
          </select>
          <label>Speaker Notes</label>
          <textarea value={speakerNotes} onChange={(e) => setSpeakerNotes(e.target.value)} rows={3} style={{ display: "block", width: "100%", marginBottom: 8 }} />
          <label>Final Notes</label>
          <textarea value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} rows={3} style={{ display: "block", width: "100%", marginBottom: 8 }} />
          <label>Co-judge (if any)</label>
          <input value={coJudgeName} onChange={(e) => setCoJudgeName(e.target.value)} placeholder="Name" style={{ display: "block", width: "100%", marginBottom: 8 }} />
          <button onClick={submit}>Submit</button>
          <button onClick={skip} style={{ marginLeft: 8 }}>Skip</button>
        </div>
      )}

      <h3>Queue</h3>
      {queue.filter((q) => q.status === "checked_in").map((q) => (
        <div key={q.evaluation_id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, padding: 8, borderBottom: "1px solid #eee" }}>
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{q.candidate_email} · {new Date(q.slot_start).toLocaleTimeString()} {q.skip_count > 0 && `(skipped ${q.skip_count}x)`}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => claim(q)}>Claim</button>
            <button onClick={() => api.judge.noShow(q.evaluation_id).then(refresh)}>No-show</button>
          </div>
        </div>
      ))}
      {queue.filter((q) => q.status === "checked_in").length === 0 && (
        <p style={{ color: "#888" }}>No one currently checked in and waiting.</p>
      )}
    </div>
  );
}
