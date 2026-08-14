"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Card, Button, Badge, Select, Table, Thead, Th, Td, EmptyState, PageLoading } from "@/components/ui";
import type { ImportResult } from "@/lib/types";

export default function CandidatesPage() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  async function importFromSheet() {
    setBusy(true);
    try {
      setResult(await api.admin.importFromSheet());
      setRefreshSignal((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Candidates"
        subtitle="Sync the candidate roster from THE SHEET, then browse and check status by round."
        action={<Button variant="primary" onClick={importFromSheet} disabled={busy}>{busy ? "Syncing…" : "Sync from Sheet1"}</Button>}
      />

      {result && (
        <Card style={{ marginBottom: "var(--space-5)" }}>
          <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
            <span><strong>{result.inserted}</strong> inserted</span>
            <span style={{ color: "var(--text-muted)" }}><strong>{result.skipped}</strong> skipped</span>
          </div>
          {result.errors && result.errors.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--danger)" }}>
                {result.errors.length} errors
              </summary>
              <ul style={{ fontSize: 12, color: "var(--danger)", marginTop: 6 }}>
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </Card>
      )}

      <CandidateSearchByRound />
      <CandidateTable refreshSignal={refreshSignal} />
    </div>
  );
}

function CandidateSearchByRound() {
  const [search, setSearch] = useState("");
  const [roundFilter, setRoundFilter] = useState<"1" | "2" | "3">("1");
  const [results, setResults] = useState<{ id: number; name: string; email: string; round1_result: string; round2_result: string }[]>([]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const t = setTimeout(() => api.admin.searchUsers(search, "candidate").then(setResults), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = results.filter((c) => {
    if (roundFilter === "1") return true;
    if (roundFilter === "2") return c.round1_result === "advanced";
    if (roundFilter === "3") return c.round1_result === "advanced" && c.round2_result === "advanced";
    return true;
  });

  return (
    <Card style={{ marginBottom: "var(--space-5)" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Check candidate status</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Select value={roundFilter} onChange={(e) => setRoundFilter(e.target.value as "1" | "2" | "3")}>
          <option value="1">Round 1 candidates</option>
          <option value="2">Round 2 candidates (R1 advanced)</option>
          <option value="3">Round 3 candidates (R1 + R2 advanced)</option>
        </Select>
        <input
          placeholder="search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "var(--bg-elevated)", fontSize: 14,
          }}
        />
      </div>
      {filtered.map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: 13 }}>
          <span>{c.name || "(no name)"} - {c.email}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <Badge tone={c.round1_result === "advanced" ? "success" : c.round1_result === "eliminated" ? "danger" : "neutral"}>R1: {c.round1_result || "-"}</Badge>
            <Badge tone={c.round2_result === "advanced" ? "success" : c.round2_result === "eliminated" ? "danger" : "neutral"}>R2: {c.round2_result || "-"}</Badge>
          </span>
        </div>
      ))}
      {search.length >= 2 && filtered.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>No matches for this round filter.</p>
      )}
    </Card>
  );
}

function CandidateTable({ refreshSignal }: { refreshSignal: number }) {
  const [page, setPage] = useState(1);
  const [round, setRound] = useState<"1" | "2" | "3">("1");
  const [data, setData] = useState<{ candidates: any[]; total: number; page_size: number } | null>(null);

  useEffect(() => { setPage(1); }, [round]);
  useEffect(() => {
    api.admin.listCandidates(page, round).then(setData);
  }, [page, round, refreshSignal]);

  if (!data) return <PageLoading />;
  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>All candidates ({data.total})</h3>
        <Select value={round} onChange={(e) => setRound(e.target.value as "1" | "2" | "3")}>
          <option value="1">Round 1 - all candidates</option>
          <option value="2">Round 2 - R1 advanced</option>
          <option value="3">Round 3 - R1 + R2 advanced</option>
        </Select>
      </div>

      {data.candidates.length === 0 ? (
        <EmptyState title="No candidates" subtitle="Nothing matches this round filter yet." />
      ) : (
        <Table>
          <Thead>
            <Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>R1</Th><Th>R2</Th>
          </Thead>
          <tbody>
            {data.candidates.map((c) => (
              <tr key={c.id}>
                <Td>{c.name || "-"}</Td>
                <Td muted>{c.email}</Td>
                <Td muted>{c.phone}</Td>
                <Td>{c.round1_result || "-"}</Td>
                <Td>{c.round2_result || "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </Card>
  );
}
