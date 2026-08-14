"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Round, Location } from "@/lib/types";

export function useRounds() {
  const [rounds, setRounds] = useState<Round[]>([]);
  useEffect(() => {
    api.rounds.list().then(setRounds).catch(() => {});
  }, []);
  return rounds;
}

export function useLocations(roundId: number | null) {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    if (!roundId) {
      setLocations([]);
      return;
    }
    api.admin.listLocations(roundId).then(setLocations).catch(() => {});
  }, [roundId]);
  return locations;
}

export function RoundPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (roundId: number, roundNumber: number) => void;
}) {
  const rounds = useRounds();
  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const r = rounds.find((r) => r.id === Number(e.target.value));
        if (r) onChange(r.id, r.number);
      }}
    >
      <option value="">Select round…</option>
      {rounds.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} (R{r.number})
        </option>
      ))}
    </select>
  );
}

export function useActiveRound() {
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.rounds.active().then(setRound).finally(() => setLoading(false));
  }, []);
  return { round, loading };
}
