"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader, Card, Badge, Button, PageLoading, EmptyState } from "@/components/ui";
import type { CandidateSummaryView } from "@/lib/types";

const RATING_TONE: Record<string, "danger" | "warning" | "success"> = {
  bad: "danger", meh: "warning", good: "success",
};

export default function CandidateSummaryPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const router = useRouter();
  const [data, setData] = useState<CandidateSummaryView | null>(null);

  useEffect(() => {
    api.admin.candidateSummary(Number(candidateId)).then(setData);
  }, [candidateId]);

  if (!data) return <PageLoading />;

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} style={{ marginBottom: 12 }}>← Back to results</Button>
      <PageHeader title={data.name || data.email} subtitle={data.email} />

      {data.rounds.length === 0 ? (
        <EmptyState title="No round data" subtitle="This candidate hasn't been scored in any round yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {data.rounds.map((rs, i) => (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge tone="accent">Round {rs.round_number}</Badge>
                  {rs.team && <Badge tone="neutral">Team {rs.team}</Badge>}
                  <Badge tone={rs.status === "completed" || rs.status === "present" ? "success" : "neutral"}>{rs.status}</Badge>
                </div>
                {rs.overall != null && <span style={{ fontWeight: 700, fontSize: 18 }}>{rs.overall}/5</span>}
              </div>

              {rs.motion && (
                <p style={{ fontSize: 13, marginTop: 10 }}><strong>Motion:</strong> {rs.motion}</p>
              )}

              {Object.keys(rs.properties).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {Object.entries(rs.properties).map(([name, rating]) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{name}:</span>
                      <Badge tone={RATING_TONE[rating]}>{rating}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {rs.comments && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>{rs.comments}</p>
              )}

              {(rs.team_a_prep || rs.team_b_prep) && (
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {rs.team_a_prep && (
                    <div style={{ background: "var(--bg-subtle)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>TEAM A PREP</div>
                      <p style={{ fontSize: 13, margin: 0 }}>{rs.team_a_prep}</p>
                    </div>
                  )}
                  {rs.team_b_prep && (
                    <div style={{ background: "var(--bg-subtle)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>TEAM B PREP</div>
                      <p style={{ fontSize: 13, margin: 0 }}>{rs.team_b_prep}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
