"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import type { CheckInLookupResult } from "@/lib/types";

export function CheckInView() {
  const { round } = useActiveRound();
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<{ id: number; name: string; email: string }[]>([]);
  const [result, setResult] = useState<CheckInLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (search.length < 2) { setCandidates([]); return; }
    const t = setTimeout(() => api.admin.searchUsers(search, "candidate").then(setCandidates), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function lookup(email: string) {
    if (!round) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      setResult(await api.judge.lookupByEmail(round.id, email));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  async function checkIn() {
    if (!result) return;
    setBusy(true);
    try {
      await api.judge.checkIn(result.evaluation_id);
      setResult({ ...result, status: "checked_in" });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1>Front Desk - Check-in</h1>
      {round && <p style={{ color: "#666", fontSize: 13 }}>Active round: {round.name}</p>}

      <input
        placeholder="search candidate by name or email…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setResult(null); }}
        style={{ width: 300, marginTop: 12 }}
      />
      {candidates.map((c) => (
        <div key={c.id} onClick={() => lookup(c.email)} style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #eee" }}>
          {c.name || "(no name)"} - <span style={{ color: "#888" }}>{c.email}</span>
        </div>
      ))}

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {result && (
        <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 16, marginTop: 16, maxWidth: 400 }}>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Location:</strong> {result.location_name}</p>
          <p><strong>Slot:</strong> {new Date(result.slot_start).toLocaleString()}</p>
          {result.status === "not_arrived" ? (
            <button onClick={checkIn} disabled={busy}>Mark checked in</button>
          ) : (
            <p style={{ color: "#666" }}>Already {result.status}.</p>
          )}
        </div>
      )}
    </div>
  );
}
