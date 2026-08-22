"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RoundPicker } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Badge, EmptyState, PageLoading } from "@/components/ui";
import type { ResultsTableView, ResultsTableRow } from "@/lib/types";

const RATING_TONE: Record<string, "danger" | "warning" | "success"> = {
  bad: "danger", meh: "warning", good: "success",
};
const RATING_RANK: Record<string, number> = { bad: 0, meh: 1, good: 2 };

type SortKey = "name" | "email" | "overall" | { propertyId: number };
type SortDir = "asc" | "desc";

export default function ResultsPage() {
  const router = useRouter();
  const [roundId, setRoundId] = useState<number | null>(null);
  const [data, setData] = useState<ResultsTableView | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    if (!roundId) return;
    setLoading(true);
    api.admin.resultsTable(roundId).then(setData).finally(() => setLoading(false));
  }, [roundId]);

  function toggleSort(key: SortKey) {
    const same = typeof key === "object"
      ? typeof sortKey === "object" && sortKey.propertyId === key.propertyId
      : sortKey === key;
    if (same) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedRows = useMemo(() => {
    if (!data) return [];
    const rows = [...data.rows];

    function valueFor(row: ResultsTableRow): number | string {
      if (sortKey === "name") return (row.name || row.email).toLowerCase();
      if (sortKey === "email") return row.email.toLowerCase();
      if (sortKey === "overall") return row.overall ?? -1;
      const rating = row.properties[sortKey.propertyId];
      return rating ? RATING_RANK[rating] : -1;
    }

    rows.sort((a, b) => {
      const va = valueFor(a);
      const vb = valueFor(b);
      let cmp: number;
      if (typeof va === "number" && typeof vb === "number") {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  function sortIndicator(key: SortKey) {
    const active = typeof key === "object"
      ? typeof sortKey === "object" && sortKey.propertyId === key.propertyId
      : sortKey === key;
    if (!active) return "";
    return sortDir === "asc" ? "  ▲" : "  ▼";
  }

  return (
    <div>
      <PageHeader title="Candidate Results" subtitle="Property ratings and overall score, per candidate, per round. Click a column header to sort." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <RoundPicker value={roundId} onChange={(id) => setRoundId(id)} />
      </Card>

      {!roundId ? (
        <EmptyState title="Select a round" />
      ) : loading ? (
        <PageLoading />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState title="No results yet" subtitle="No candidates have been scored in this round." />
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)" }}>
                <th style={sortableThStyle} onClick={() => toggleSort("name")}>Name{sortIndicator("name")}</th>
                <th style={sortableThStyle} onClick={() => toggleSort("email")}>Email{sortIndicator("email")}</th>
                {data.properties.map((p) => (
                  <th key={p.id} style={sortableThStyle} onClick={() => toggleSort({ propertyId: p.id })}>
                    {p.name}{sortIndicator({ propertyId: p.id })}
                  </th>
                ))}
                <th style={sortableThStyle} onClick={() => toggleSort("overall")}>Overall{sortIndicator("overall")}</th>

              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.candidate_id}
                  onClick={() => router.push(`/admin/results/${row.candidate_id}`)}
                  style={{ cursor: "pointer", borderTop: "1px solid var(--border)" }}
                >
                  <td style={{ ...tdStyle, fontWeight: 600, color: "var(--accent)" }}>{row.name || "-"}</td>
                  <td style={tdStyle}>{row.email}</td>
                  {data.properties.map((p) => {
                    const rating = row.properties[p.id];
                    return (
                      <td key={p.id} style={tdStyle}>
                        {rating ? <Badge tone={RATING_TONE[rating]}>{rating}</Badge> : <span style={{ color: "var(--text-faint)" }}> -</span>}
                      </td>
                    );
                  })}
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{row.overall ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)" };
const sortableThStyle: React.CSSProperties = { ...thStyle, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { padding: "10px 14px" };
