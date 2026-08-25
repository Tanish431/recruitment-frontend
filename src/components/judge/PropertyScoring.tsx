"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RatingControl } from "@/components/ui/RatingControl";
import { OverallSlider } from "@/components/ui/OverallSlider";
import type { ScoringProperty, PropertyRating } from "@/lib/types";

export function PropertyScoring({
  roundId,
  kind,
  targetId,
  overall,
  onOverallChangeAction,
  onCompleteChangeAction,
}: {
  roundId: number;
  kind: "evaluation" | "participant";
  targetId: number;
  overall: number;
  onOverallChangeAction: (v: number) => void;
  onCompleteChangeAction?: (complete: boolean) => void;
}) {
  const [properties, setProperties] = useState<ScoringProperty[]>([]);
  const [ratings, setRatings] = useState<Record<number, PropertyRating>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoaded(false);
      const nextProperties = await api.properties.list(roundId);
      const fetchRatings = kind === "evaluation" ? api.judge.evaluationRatings(targetId) : api.judge.participantRatings(targetId);
      const nextRatings = await fetchRatings.catch(() => ({}));
      if (cancelled) return;
      setProperties(nextProperties);
      setRatings(nextRatings);
      setLoaded(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [roundId, targetId, kind]);

  async function rate(propertyId: number, rating: PropertyRating) {
    setRatings((prev) => ({ ...prev, [propertyId]: rating }));
    if (kind === "evaluation") {
      await api.judge.rateEvaluationProperty(targetId, propertyId, rating);
    } else {
      await api.judge.rateParticipantProperty(targetId, propertyId, rating);
    }
  }

  const overallComplete = overall >= 1 && overall <= 5;
  const propertiesComplete = properties.length === 0 || properties.every((p) => ratings[p.id]);
  const complete = loaded && overallComplete && propertiesComplete;

  useEffect(() => {
    onCompleteChangeAction?.(complete);
  }, [complete, onCompleteChangeAction]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {properties.map((p) => (
        <div key={p.id}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{p.name}</label>
          <RatingControl value={ratings[p.id] ?? null} onChange={(r) => rate(p.id, r)} />
        </div>
      ))}

      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Overall</label>
        <OverallSlider value={overall} onChange={onOverallChangeAction} />
      </div>

      {!complete && loaded && properties.length > 0 && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--warning)" }}>
          Rate every property before saving.
        </p>
      )}
    </div>
  );
}
