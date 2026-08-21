/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Button, Input, EmptyState } from "@/components/ui";
import type { ScoringProperty } from "@/lib/types";

export default function PropertiesPage() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const [properties, setProperties] = useState<ScoringProperty[]>([]);
  const [name, setName] = useState("");

  async function refresh() {
    if (roundId) setProperties(await api.properties.list(roundId));
  }
  useEffect(() => { refresh(); }, [roundId]);

  async function add() {
    if (!roundId || !name) return;
    await api.admin.createProperty(roundId, name);
    setName("");
    refresh();
  }

  async function remove(id: number) {
    await api.admin.deleteProperty(id);
    refresh();
  }

  return (
    <div>
      <PageHeader title="Scoring Properties" subtitle="Define the 3-point rating properties judges score, per round. Overall (1-5) is always included separately." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <RoundPicker value={roundId} onChange={(id) => setRoundId(id)} />
      </Card>

      {!roundId ? (
        <EmptyState title="Select a round" />
      ) : (
        <Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <Input placeholder="e.g. Speaking, Ideas, Articulation" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: "1 1 240px" }} />
            <Button variant="primary" onClick={add} disabled={!name}>Add property</Button>
          </div>

          {properties.length === 0 ? (
            <EmptyState title="No properties yet" subtitle="Add one above to start building the rubric." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {properties.map((p) => (
                <div key={p.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: 14, minWidth: 0, overflowWrap: "anywhere" }}>{p.name}</span>
                  <Button size="sm" variant="danger" onClick={() => remove(p.id)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
