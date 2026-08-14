"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Card, Button, Input, EmptyState } from "@/components/ui";

export default function JudgesPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: number; name: string; email: string; role: string }[]>([]);
  const [judges, setJudges] = useState<{ id: number; name: string; email: string }[]>([]);

  async function refreshJudges() {
    setJudges(await api.admin.searchUsers("", "judge"));
  }
  useEffect(() => { refreshJudges(); }, []);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const t = setTimeout(() => api.admin.searchUsers(search, "candidate").then(setResults), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function promote(email: string) {
    await api.admin.promoteToJudge(email);
    setSearch("");
    setResults([]);
    refreshJudges();
  }

  return (
    <div>
      <PageHeader title="Judges" subtitle="Promote candidates to judge, then they self-serve their own check-in/queue/claim flows." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Promote a candidate</h3>
        <Input placeholder="search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        {results.map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 14 }}>{r.name || "(no name)"} - <span style={{ color: "var(--text-muted)" }}>{r.email}</span></span>
            <Button size="sm" variant="primary" onClick={() => promote(r.email)}>Promote</Button>
          </div>
        ))}
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Current judges ({judges.length})</h3>
        {judges.length === 0 ? (
          <EmptyState title="No judges yet" subtitle="Promote a candidate above to get started." />
        ) : (
          judges.map((j) => (
            <div key={j.id} style={{ padding: "6px 0", fontSize: 14, borderTop: "1px solid var(--border)" }}>
              {j.name || "(no name)"} - <span style={{ color: "var(--text-muted)" }}>{j.email}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
