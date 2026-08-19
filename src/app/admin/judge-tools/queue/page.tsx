"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker } from "@/components/RoundLocationPicker";
import type { QueueItem } from "@/lib/types";

export default function JudgeQueuePage() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [active, setActive] = useState<QueueItem | null>(null);
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");
  const [motion, setMotion] = useState("Motion 1");

  async function refresh() {
    if (roundId) setQueue(await api.judge.queue(roundId));
  }
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000); // live-ish polling
    return () => clearInterval(t);
  }, [roundId]);

  async function claim(item: QueueItem) {
    await api.judge.claim(item.evaluation_id);
    setActive(item);
    setScore(0);
    setComments("");
    refresh();
  }

  async function submit() {
    if (!active) return;
    await api.judge.submit(active.evaluation_id, score, comments, motion);
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
          <h3>Interviewing: {active.candidate_email}</h3>
          <label>Score</label>
          <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} style={{ display: "block", marginBottom: 8 }} />
          <label>Motion</label>
          <select value={motion} onChange={(e) => setMotion(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8 }}>
            <option>Motion 1</option>
            <option>Motion 2</option>
            <option>Motion 3</option>
          </select>
          <label>Comments</label>
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} style={{ display: "block", width: "100%", marginBottom: 8 }} />
          <button onClick={submit}>Submit</button>
          <button onClick={skip} style={{ marginLeft: 8 }}>Skip</button>
        </div>
      )}

      <h3>Queue</h3>
      {queue.filter((q) => q.status === "checked_in").map((q) => (
        <div key={q.evaluation_id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #eee" }}>
          <span>{q.candidate_email} · {new Date(q.slot_start).toLocaleTimeString()} {q.skip_count > 0 && `(skipped ${q.skip_count}x)`}</span>
          <div>
            <button onClick={() => claim(q)}>Claim</button>
            <button onClick={() => api.judge.noShow(q.evaluation_id).then(refresh)} style={{ marginLeft: 6 }}>No-show</button>
          </div>
        </div>
      ))}
      {queue.filter((q) => q.status === "checked_in").length === 0 && (
        <p style={{ color: "#888" }}>No one currently checked in and waiting.</p>
      )}
    </div>
  );
}
