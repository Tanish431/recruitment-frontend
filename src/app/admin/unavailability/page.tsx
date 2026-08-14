"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoundPicker } from "@/components/RoundLocationPicker";
import { PageHeader, Card, Table, Thead, Th, Td, EmptyState } from "@/components/ui";
import type { AdminUnavailabilityView } from "@/lib/types";

export default function UnavailabilityPage() {
  const [roundId, setRoundId] = useState<number | null>(null);
  const [entries, setEntries] = useState<AdminUnavailabilityView[]>([]);

  useEffect(() => {
    if (roundId) api.admin.listUnavailability(roundId).then(setEntries);
  }, [roundId]);

  return (
    <div>
      <PageHeader title="Candidate Unavailability" subtitle="Dates candidates flagged as unable to attend, per round." />

      <Card style={{ marginBottom: "var(--space-5)" }}>
        <RoundPicker value={roundId} onChange={(id) => setRoundId(id)} />
      </Card>

      {!roundId ? (
        <EmptyState title="Select a round" subtitle="Pick a round above to see submitted unavailability." />
      ) : entries.length === 0 ? (
        <EmptyState title="No submissions" subtitle="No one has flagged unavailability for this round yet." />
      ) : (
        <Table>
          <Thead><Th>Name</Th><Th>Candidate</Th><Th>Unavailable dates</Th><Th>Note</Th></Thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.candidate_email}>
                <Td>{e.candidate_name || "-"}</Td>
                <Td muted>{e.candidate_email}</Td>
                <Td>{e.unavailable_dates.join(", ")}</Td>
                <Td muted>{e.note}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
