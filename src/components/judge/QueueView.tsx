/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PropertyScoring } from "@/components/judge/PropertyScoring";
import { PageHeader, Card, Button, Badge, EmptyState, PageLoading } from "@/components/ui";
import type { QueueItem } from "@/lib/types";

export function QueueView() {
  const { round, loading: roundLoading } = useActiveRound();
  const roundId = round?.id ?? null;
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [active, setActive] = useState<QueueItem | null>(null);
  const [score, setScore] = useState(3);
  const [comments, setComments] = useState("");
  const [motion, setMotion] = useState("Motion 1");

  async function refresh() {
    if (roundId) setQueue(await api.judge.queue(roundId));
  }
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [roundId]);

  async function claim(item: QueueItem) {
    await api.judge.claim(item.evaluation_id);
    setActive(item);
    setScore(3);
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

  if (roundLoading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;

  const waiting = queue.filter((q) => q.status === "checked_in");

  return (
    <div>
      <PageHeader title={`Round ${round.number} Queue`} subtitle="Claim a checked-in candidate to begin scoring." />

      {active && (
        <Card style={{ marginBottom: "var(--space-5)", borderColor: "var(--accent)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>
            Interviewing: {active.candidate_name || active.candidate_email}
          </h3>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", margin: "12px 0 6px" }}>Motion</label>
          <select value={motion} onChange={(e) => setMotion(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-elevated)", marginBottom: 14 }}>
            <option>Motion 1</option>
            <option>Motion 2</option>
            <option>Motion 3</option>
          </select>

          <PropertyScoring roundId={round.id} kind="evaluation" targetId={active.evaluation_id} overall={score} onOverallChange={setScore} />
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Comments"
            rows={3}
            style={{ width: "100%", marginTop: 14, padding: 9, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <Button variant="primary" onClick={submit}>Submit</Button>
            <Button variant="ghost" onClick={skip}>Skip</Button>
          </div>
        </Card>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Waiting ({waiting.length})</h3>
      {waiting.length === 0 ? (
        <EmptyState title="No one waiting" subtitle="Check candidates in from the Check-in page." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {waiting.map((q) => (
            <Card key={q.evaluation_id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{q.candidate_name || q.candidate_email}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(q.slot_start).toLocaleTimeString()}
                    {q.skip_count > 0 && <span style={{ marginLeft: 8, display: "inline-block" }}><Badge tone="warning">skipped {q.skip_count}x</Badge></span>}
                  </div>
                </div>
                {round.number === 3 /* only admins reach this page for R3 per nav gating, but double-guard anyway */ ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant="primary" onClick={() => claim(q)}>Claim</Button>
                    <Button size="sm" variant="danger" onClick={() => api.judge.noShow(q.evaluation_id).then(refresh)}>No-show</Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant="primary" onClick={() => claim(q)}>Claim</Button>
                    <Button size="sm" variant="danger" onClick={() => api.judge.noShow(q.evaluation_id).then(refresh)}>No-show</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
