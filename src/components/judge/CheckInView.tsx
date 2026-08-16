"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Input, Badge, EmptyState, PageLoading } from "@/components/ui";
import type { CheckInLookupResult } from "@/lib/types";

export function CheckInView() {
  const { round, loading: roundLoading } = useActiveRound();
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

  if (roundLoading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;

  return (
    <div>
      <PageHeader title={`Round ${round.number} Check-in`} subtitle="Search a candidate and mark them arrived." />

      <Card>
        <Input
          placeholder="search candidate by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setResult(null); }}
        />
        {candidates.map((c) => (
          <div
            key={c.id}
            onClick={() => lookup(c.email)}
            style={{ padding: "8px 4px", cursor: "pointer", borderTop: "1px solid var(--border)", fontSize: 14 }}
          >
            {c.name || "(no name)"} — <span style={{ color: "var(--text-muted)" }}>{c.email}</span>
          </div>
        ))}
      </Card>

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}

      {result && (
        <Card style={{ marginTop: "var(--space-4)", maxWidth: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600 }}>Status</span>
            <Badge tone={result.status === "checked_in" ? "success" : "neutral"}>{result.status}</Badge>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0" }}>{result.location_name}</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 14px" }}>{new Date(result.slot_start).toLocaleString()}</p>
          {result.status === "not_arrived" ? (
            <Button variant="primary" onClick={checkIn} disabled={busy}>Mark checked in</Button>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Already {result.status}.</p>
          )}
        </Card>
      )}
    </div>
  );
}
