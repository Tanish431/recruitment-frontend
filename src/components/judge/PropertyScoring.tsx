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
  onOverallChange,
}: {
  roundId: number;
  kind: "evaluation" | "participant";
  targetId: number;
  overall: number;
  onOverallChange: (v: number) => void;
}) {
  const [properties, setProperties] = useState<ScoringProperty[]>([]);
  const [ratings, setRatings] = useState<Record<number, PropertyRating>>({});

  useEffect(() => {
    api.properties.list(roundId).then(setProperties);
    const fetchRatings = kind === "evaluation" ? api.judge.evaluationRatings(targetId) : api.judge.participantRatings(targetId);
    fetchRatings.then(setRatings).catch(() => setRatings({}));
  }, [roundId, targetId]);

  async function rate(propertyId: number, rating: PropertyRating) {
    setRatings((prev) => ({ ...prev, [propertyId]: rating }));
    if (kind === "evaluation") {
      await api.judge.rateEvaluationProperty(targetId, propertyId, rating);
    } else {
      await api.judge.rateParticipantProperty(targetId, propertyId, rating);
    }
  }

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
        <OverallSlider value={overall} onChange={onOverallChange} />
      </div>
    </div>
  );
}
