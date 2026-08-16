"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User, AssignmentView, UnavailabilityEntry } from "@/lib/types";
import { Card, Badge, Button, PageHeader } from "@/components/ui";
import { UserMenu } from "@/components/UserMenu";
import { UnavailabilityForm } from "@/components/UnavailabilityForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResultToast } from "@/components/ResultToast";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<AssignmentView[]>([]);
  const [unavailability, setUnavailability] = useState<UnavailabilityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth
      .me()
      .then(async (u) => {
        if (!u.phone || !u.whatsapp) {
          router.replace("/onboarding");
          return;
        }
        setUser(u);
        setLoading(false);
        api.candidate.myAssignments().then((a) => setAssignments(a ?? [])).catch(() => setAssignments([]));
        api.candidate.myUnavailability().then((ua) => setUnavailability(ua ?? [])).catch(() => setUnavailability([]));
      })
      .catch(() => router.replace("/"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null;
  if (!user) return null;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--space-6) var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Hi, {user.name || user.campus_email.split("@")[0]}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "4px 0 0" }}>Welcome back</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <UserMenu user={user} onLogout={() => api.auth.logout().then(() => router.replace("/"))} />
        </div>
      </div>

      {(user.role === "admin" || user.role === "judge") && (
        <a href="/judge" style={{ display: "inline-block", marginBottom: "var(--space-5)", color: "var(--accent)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Go to judge/admin tools →
        </a>
      )}

      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: "var(--space-3)" }}>Your assignment</h2>
        {assignments.length === 0 ? (
          <Card><p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>No assignment yet for the active round.</p></Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {assignments.map((a) => (
              <AssignmentCard key={a.assignment_id} assignment={a} />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: "var(--space-6)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: "var(--space-3)" }}>Submit unavailability</h2>
        <Card>
          <UnavailabilityForm
            onSubmitted={(entry) =>
              setUnavailability((prev) => [...prev.filter((u) => u.round_number !== entry.round_number), entry])
            }
          />
        </Card>
      </section>

      {unavailability.length > 0 && (
        <section style={{ marginTop: "var(--space-6)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: "var(--space-3)" }}>Submitted unavailability</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {unavailability.map((u) => (
              <Card key={u.round_number} style={{ padding: "var(--space-3) var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span><Badge tone="neutral">Round {u.round_number}</Badge> {u.unavailable_dates.join(", ")}</span>
                </div>
                {u.note && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0" }}>{u.note}</p>}
              </Card>
            ))}
          </div>
        </section>
      )}
      {user && <ResultToast user={user} />}
    </main>
  );
}

function AssignmentCard({ assignment: a }: { assignment: AssignmentView }) {
  const [showQuery, setShowQuery] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(a.query_status != null);

  async function submitQuery() {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      await api.candidate.raiseQuery(a.assignment_id, reason);
      setSubmitted(true);
      setShowQuery(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit");
    } finally {
      setBusy(false);
    }
  }

  async function cancelQuery() {
    if (!a.query_id) return;
    setBusy(true);
    try {
      await api.candidate.cancelQuery(a.query_id);
      setSubmitted(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to cancel");
    } finally {
      setBusy(false);
    }
  }

  const statusTone = a.status === "confirmed" ? "success" : "warning";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge tone="accent">Round {a.round_number}</Badge>
            {a.team && <Badge tone="neutral">Team {a.team}</Badge>}
          </div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>{a.location_name}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {new Date(a.start_time).toLocaleString()} · {a.duration_min} min
          </div>
        </div>
        <Badge tone={statusTone as any}>{a.status}</Badge>
      </div>

      {submitted && a.query_status === "pending" && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone="warning">Query pending</Badge>
          <Button size="sm" variant="ghost" onClick={cancelQuery} disabled={busy}>Cancel query</Button>
        </div>
      )}
      {submitted && a.query_status === "resolved" && (
        <div style={{ marginTop: 12 }}><Badge tone="success">Query resolved</Badge></div>
      )}

      {!submitted && a.status === "confirmed" && (
        <div style={{ marginTop: 12 }}>
          {!showQuery ? (
            <Button size="sm" variant="secondary" onClick={() => setShowQuery(true)}>Can't make this slot?</Button>
          ) : (
            <div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason you can't make it"
                rows={2}
                style={{
                  width: "100%", padding: 9, borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)", background: "var(--bg-elevated)", fontSize: 13,
                }}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{error}</p>}
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Button size="sm" variant="primary" onClick={submitQuery} disabled={busy || !reason}>Submit</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowQuery(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
