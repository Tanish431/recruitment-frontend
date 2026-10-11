"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Badge, EmptyState, PageLoading } from "@/components/ui";
import type { OpenSlotToJoin, MyClaimedSlot } from "@/lib/types";

export function Round3JoinPanel() {
  const { round, loading } = useActiveRound();
  const [open, setOpen] = useState<OpenSlotToJoin[]>([]);
  const [mine, setMine] = useState<MyClaimedSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function refresh() {
    if (!round) return;
    try {
      const [o, m] = await Promise.all([
        api.judge.openSlotsToJoin(round.id),
        api.judge.myClaimedSlots(round.id),
      ]);
      setOpen(o ?? []);
      setMine(m ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load slots.");
    }
  }

  useEffect(() => {
    if (!round) return;
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.id]);

  async function join(slotId: number) {
    setBusyId(slotId);
    setError(null);
    try {
      await api.judge.joinSlot(slotId);
    } catch (e: any) {
      setError(e.message || "Failed to join slot.");
    } finally {
      setBusyId(null);
      await refresh();
    }
  }

  if (loading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;

  return (
    <div>
      <PageHeader
        title="Round 3 — Bias Check"
        subtitle="Join an interview slot as one of two observing judges. Only the admin enters scores."
      />

      {error && (
        <div style={{ background: "var(--danger-soft)", color: "var(--danger)", padding: "10px 12px", borderRadius: "var(--radius-sm)", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Your slots</h3>
      {mine.length === 0 ? (
        <EmptyState title="You haven't joined any slots yet" subtitle="Pick one from the open slots below." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "var(--space-5)" }}>
          {mine.map((s) => (
            <Card key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.location_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(s.start_time).toLocaleString()}</div>
                </div>
                <Badge tone={s.presence_confirmed ? "success" : "warning"}>
                  {s.presence_confirmed ? "Admin confirmed you're present" : "Awaiting admin confirmation"}
                </Badge>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
                You're here as a bias-check observer — the admin enters the scores.
              </p>
            </Card>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "var(--space-5) 0 10px" }}>Open slots</h3>
      {open.length === 0 ? (
        <EmptyState title="No slots to join" subtitle="Waiting for an admin to create interview slots, or every slot is already staffed." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {open.map((s) => (
            <Card key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.location_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(s.start_time).toLocaleString()} · hosted by {s.host_name}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone="neutral">
                    <Users size={12} style={{ marginRight: 4 }} />
                    {s.judges_joined}/{s.judges_needed} judges
                  </Badge>
                  <Button size="sm" variant="primary" onClick={() => join(s.id)} disabled={busyId === s.id}>
                    {busyId === s.id ? "Joining…" : "Join"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
