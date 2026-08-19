"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Input, Badge, EmptyState, PageLoading } from "@/components/ui";
import type { CheckInLookupResult } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";

interface CandidateSearchResult {
  id: number;
  name: string;
  email: string;
}

export function CheckInView() {
  const { round, loading: roundLoading } = useActiveRound();
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<CandidateSearchResult[]>([]);
  const [result, setResult] = useState<CheckInLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      if (search.length < 2) {
        setCandidates([]);
        return;
      }

      try {
        const results = await api.judge.searchUsersForJudge(search);
        if (!cancelled) {
          setCandidates(results.map((r) => ({ id: r.id, name: r.name, email: r.email })));
        }
      } catch {
        if (!cancelled) setCandidates([]);
      }
    }

    const t = setTimeout(() => void runSearch(), 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
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
      <PageHeader
        title={`Round ${round.number} Check-in`}
        subtitle="Search by name or email, then mark the candidate arrived."
      />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Active round</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{round.name}</div>
          </div>
          <Badge tone="accent">Live check-in</Badge>
        </div>
      </Card>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(320px, 1fr) minmax(320px, 420px)",
        gap: 16,
        alignItems: "start",
      }}>
        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Find a candidate</h3>
          <Input
            placeholder="search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setResult(null);
              setError(null);
            }}
          />

          <div style={{ marginTop: 12 }}>
            {search.length < 2 ? (
              <EmptyState title="Start typing" subtitle="Enter at least 2 characters to search the roster." />
            ) : candidates.length === 0 ? (
              <EmptyState title="No matches" subtitle="Try a different name or email." />
            ) : (
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => void lookup(c.email)}
                    style={{
                      padding: "10px 12px",
                      cursor: busy ? "default" : "pointer",
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name || "(no name)"}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Check-in record</h3>

          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--danger-soft)",
                color: "var(--danger)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {!result ? (
            <EmptyState title="No candidate selected" subtitle="Pick a search result to open the check-in record." />
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {result.status === "checked_in" ? "Checked in" : "Ready to check in"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Candidate ID #{result.candidate_id}</div>
                </div>
                <Badge tone={result.status === "checked_in" ? "success" : "warning"}>{result.status}</Badge>
              </div>

              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{result.location_name}</div>
                </div>

                <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Slot</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(result.slot_start).toLocaleString()}</div>
                </div>
              </div>

              {result.status === "not_arrived" ? (
                <Button variant="primary" onClick={checkIn} disabled={busy}>
                  {busy ? "Marking…" : "Mark checked in"}
                </Button>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Already {result.status}.</p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
