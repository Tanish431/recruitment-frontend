"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User, AssignmentView, UnavailabilityEntry } from "@/lib/types";
import { Card, Badge, Button, PageLoading } from "@/components/ui";
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
  }, [router]);


  if (loading || !user) return <PageLoading />;

  const displayName = user.name || user.campus_email.split("@")[0];
  const openQueries = assignments.filter((assignment) => assignment.query_status === "pending");


  return (
    <main className="dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <div className="eyebrow">Candidate portal</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1, letterSpacing: "-0.065em", margin: "16px 0 8px" }}>Welcome back, {displayName}.</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Your recruitment journey, all in one place.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <UserMenu user={user} onLogout={() => api.auth.logout().then(() => router.replace("/"))} />
        </div>
      </div>

      {(user.role === "admin" || user.role === "judge") && (
        <a href="/judge" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--accent-strong)", fontSize: 12, fontWeight: 800, textDecoration: "none", marginBottom: 22 }}>
          Open judge and admin tools <span>→</span>
        </a>
      )}


      <div className="dashboard-grid">
        <section>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
            <div><div className="mono-label">Schedule</div><h2 style={{ fontSize: 20, letterSpacing: "-0.045em", margin: "7px 0 0" }}>Your assignments</h2></div>
            <span style={{ color: "var(--text-faint)", fontSize: 12 }}>{assignments.length} total</span>
          </div>
          {assignments.length === 0 ? (
            <Card><div style={{ padding: "16px 2px" }}><div style={{ fontSize: 16, fontWeight: 800 }}>No assignment yet.</div><p style={{ color: "var(--text-muted)", margin: "7px 0 0", fontSize: 13, lineHeight: 1.55 }}>Your interview schedule will appear here once the next round is ready.</p></div></Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{assignments.map((a) => <AssignmentCard key={a.assignment_id} assignment={a} />)}</div>
          )}

          <div style={{ marginTop: 28 }}>
            <div className="mono-label" style={{ marginBottom: 10 }}>Open queries</div>
            {openQueries.length === 0 ? (
              <Card style={{ padding: 16 }}><div style={{ fontSize: 13, fontWeight: 800 }}>Nothing open right now.</div><p style={{ color: "var(--text-muted)", fontSize: 11, lineHeight: 1.5, margin: "6px 0 0" }}>If a scheduled slot does not work, raise a query from its assignment card.</p></Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {openQueries.map((assignment) => (
                  <div key={assignment.assignment_id} className="surface-card" style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Round {assignment.round_number}</span><Badge tone="warning">Pending</Badge></div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 6 }}>{assignment.location_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unavailability.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div className="mono-label" style={{ marginBottom: 10 }}>Submitted windows</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {unavailability.map((u) => (
                  <div key={u.round_number} className="surface-card" style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", fontSize: 12 }}><Badge tone="neutral">Round {u.round_number}</Badge><span style={{ color: "var(--text-muted)", textAlign: "right" }}>{u.unavailable_dates.join(", ")}</span></div>
                    {u.note && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.45 }}>{u.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside>
          <div style={{ marginBottom: 12 }}><div className="mono-label">Availability</div><h2 style={{ fontSize: 20, letterSpacing: "-0.045em", margin: "7px 0 0" }}>Need a different time?</h2></div>
          <Card style={{ padding: 18 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.55, margin: "0 0 16px" }}>Tell us when you&apos;re <b>UNAVAILABLE</b> so we can plan around your schedule.</p>
            <UnavailabilityForm onSubmitted={(entry) => setUnavailability((prev) => [...prev.filter((u) => u.round_number !== entry.round_number), entry])} />
          </Card>

        </aside>
      </div>
      <ResultToast user={user} />
    </main>
  );
}

function AssignmentCard({ assignment: a }: { assignment: AssignmentView }) {
  const [showQuery, setShowQuery] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryStatus, setQueryStatus] = useState(a.query_status);
  // const submitted = queryStatus != null;

  async function submitQuery() {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      await api.candidate.raiseQuery(a.assignment_id, reason);
      setQueryStatus("pending");
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
    setError(null);
    try {
      await api.candidate.cancelQuery(a.query_id);
      setQueryStatus(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to cancel");
    } finally {
      setBusy(false);
    }
  }

  const statusTone = a.status === "confirmed" ? "success" : "warning";
  const date = new Date(a.start_time);
  const dateLabel = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const [submitted, setSubmitted] = useState(a.query_status === "pending");

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 50, height: 56, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: 13, background: "var(--accent-soft)", color: "var(--accent-strong)" }}><span className="mono-label" style={{ color: "inherit", fontSize: 9 }}>{date.toLocaleDateString(undefined, { month: "short" })}</span><strong style={{ fontSize: 21, lineHeight: 1 }}>{date.getDate()}</strong></div>
            <div><div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7 }}><Badge tone="accent">Round {a.round_number}</Badge>{a.team && <Badge tone="neutral">Team {a.team}</Badge>}</div><div style={{ fontWeight: 800, marginTop: 9, fontSize: 15 }}>{a.location_name}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{dateLabel} · {timeLabel} · {a.duration_min} min</div></div>
          </div>
          <Badge tone={statusTone}>{a.status}</Badge>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 17, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Be ready 10 minutes early</span>
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Bring your point of view</span>
        </div>

        {submitted && queryStatus === "pending" && <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><Badge tone="warning">Query pending</Badge><Button size="sm" variant="ghost" onClick={cancelQuery} disabled={busy}>Cancel query</Button></div>}
        {submitted && queryStatus === "resolved" && <div style={{ marginTop: 12 }}><Badge tone="success">Query resolved</Badge></div>}

        {!submitted && a.status === "confirmed" && (
          <div style={{ marginTop: 14 }}>
            {!showQuery ? <Button size="sm" variant="secondary" onClick={() => setShowQuery(true)}>Can&apos;t make this slot?</Button> : (
              <div>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell us what timing would work better" rows={3} style={{ width: "100%", resize: "vertical", fontSize: 12 }} />
                {error && <p style={{ color: "var(--danger)", fontSize: 12, margin: "7px 0 0" }}>{error}</p>}
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}><Button size="sm" variant="primary" onClick={submitQuery} disabled={busy || !reason}>Submit query</Button><Button size="sm" variant="ghost" onClick={() => setShowQuery(false)}>Cancel</Button></div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
