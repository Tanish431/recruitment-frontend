"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Card, Button, Badge, EmptyState, PageLoading } from "@/components/ui";
import { useActiveRound } from "@/components/RoundLocationPicker";
import type { MyClaimedSlot, OpenSlotToJoin } from "@/lib/types";

export function Round3JoinPanel() {
  const { round, loading } = useActiveRound();
  const [open, setOpen] = useState<OpenSlotToJoin[]>([]);
  const [joined, setJoined] = useState<MyClaimedSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!round) return;
      const [openSlots, mySlots] = await Promise.all([
        api.judge.openSlotsToJoin(round.id),
        api.judge.myClaimedSlots(round.id),
      ]);
      if (cancelled) return;
      setOpen(openSlots);
      setJoined(mySlots);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [round]);

  async function join(slotId: number) {
    setBusy(true);
    setError(null);
    try {
      await api.judge.joinSlot(slotId);
      if (!round) return;
      const [openSlots, mySlots] = await Promise.all([
        api.judge.openSlotsToJoin(round.id),
        api.judge.myClaimedSlots(round.id),
      ]);
      setOpen(openSlots);
      setJoined(mySlots);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;

  return (
    <div>
      <PageHeader
        title="Round 3 — Bias Check"
        subtitle="Admins create interview slots. Join as one of two observing judges — only the admin enters scores."
      />

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {open.length === 0 ? (
        <EmptyState title="No slots to join" subtitle="Waiting for an admin to create interview slots." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {open.map((s) => (
            <Card key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.location_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(s.start_time).toLocaleString()} · hosted by {s.host_name}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge tone={s.judges_joined >= s.judges_needed ? "success" : "neutral"}>
                    <Users size={12} style={{ marginRight: 4 }} />
                    {s.judges_joined}/{s.judges_needed} judges
                  </Badge>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => join(s.id)}
                    disabled={busy || joined.some((slot) => slot.id === s.id)}
                  >
                    {joined.some((slot) => slot.id === s.id) ? "Joined" : "Join"}
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
