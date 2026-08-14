"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Card, Badge, Button } from "@/components/ui";
import type { Round, PendingQueryView } from "@/lib/types";

export default function AdminOverview() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [queries, setQueries] = useState<PendingQueryView[]>([]);
  const [syncResult, setSyncResult] = useState<Record<number, { updated: number; skipped: number }>>({});

  async function refreshRounds() {
    setRounds(await api.rounds.list());
  }
  useEffect(() => {
    refreshRounds();
    api.admin.listPendingQueries().then(setQueries).catch(() => {});
  }, []);

  async function syncResults(roundId: number) {
    const res = await api.admin.syncRoundResults(roundId);
    setSyncResult((prev) => ({ ...prev, [roundId]: res }));
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`${queries.length} pending ${queries.length === 1 ? "query" : "queries"} across all rounds`}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {rounds.map((r) => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <Badge tone="neutral">Round {r.number}</Badge>
                {r.is_active && <Badge tone="success">Active</Badge>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {(r.number === 1 || r.number === 2) && (
                  <Button size="sm" variant="ghost" onClick={() => syncResults(r.id)}>
                    Sync results
                  </Button>
                )}
                {!r.is_active && (
                  <Button size="sm" variant="primary" onClick={() => api.admin.activateRound(r.id).then(refreshRounds)}>
                    Activate
                  </Button>
                )}
              </div>
            </div>
            {syncResult[r.id] && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                Updated {syncResult[r.id].updated}, skipped {syncResult[r.id].skipped}
              </p>
            )}
          </Card>
        ))}
      </div>

      {rounds.some((r) => r.is_active) && (
        <Button
          variant="secondary"
          onClick={() => api.admin.deactivateRounds().then(refreshRounds)}
          style={{ marginTop: "var(--space-4)" }}
        >
          Deactivate all (maintenance mode)
        </Button>
      )}
    </div>
  );
}
