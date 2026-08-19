"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { MultiDateCalendar, Chip, Button } from "@/components/ui";
import type { UnavailabilityEntry } from "@/lib/types";

export function UnavailabilityForm({
  onSubmitted,
}: {
  onSubmitted: (entry: UnavailabilityEntry) => void;
}) {
  const { round } = useActiveRound();
  const [dates, setDates] = useState<string[]>([]);
  const [reason, setReason] = useState("Other Commitments");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit() {
    if (!round) return;
    if (dates.length === 0) {
      setError("Select at least one date.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.candidate.submitUnavailability(round.id, dates, reason, note);
      setSaved(true);
      onSubmitted({
        round_number: round.number,
        unavailable_dates: dates,
        reason,
        note,
        submitted_at: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit");
    } finally {
      setBusy(false);
    }
  }

  if (!round) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No round is currently active.</p>;
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        Tap any dates you wont be able to attend for <strong>{round.name}</strong>.
      </p>

      <div style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap" }}>
        <MultiDateCalendar selected={dates} onChange={setDates} />

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Selected dates {dates.length > 0 && `(${dates.length})`}
          </div>
          {dates.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>None selected yet.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {[...dates].sort().map((d) => (
                <Chip key={d} onRemove={() => setDates(dates.filter((x) => x !== d))}>
                  {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Chip>
              ))}
            </div>
          )}

          <label style={{ fontSize: 13, fontWeight: 600, display: "block", margin: "12px 0 6px" }}>Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", padding: 9, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
          >
            <option>Other Commitments</option>
            <option>Tests</option>
            <option>Other</option>
          </select>

          <label style={{ fontSize: 13, fontWeight: 600, display: "block", margin: "12px 0 6px" }}>
            Note <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            placeholder="Do mention when you are free…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: 9,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              fontSize: 13,
              resize: "vertical",
            }}
          />

          {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{error}</p>}
          {saved && <p style={{ color: "var(--success)", fontSize: 13, marginTop: 10 }}>Saved.</p>}

          <Button variant="primary" onClick={submit} disabled={busy} style={{ marginTop: 14 }}>
            {busy ? "Saving…" : "Submit unavailability"}
          </Button>
        </div>
      </div>
    </div>
  );
}
