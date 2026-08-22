"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, X, Users, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useActiveRound, useLocations } from "@/components/RoundLocationPicker";
import { PropertyScoring } from "@/components/judge/PropertyScoring";
import {
  PageHeader,
  Card,
  Button,
  Select,
  Badge,
  EmptyState,
  PageLoading,
} from "@/components/ui";
import type {
  MyClaimedSlot,
  ParticipantView,
  OpenSlotToJoin,
  CoJudgeStatus,
} from "@/lib/types";

export function Round2View() {
  const { round, loading: roundLoading } = useActiveRound();
  const roundId = round?.id ?? null;
  const locations = useLocations(roundId);

  const [tab, setTab] = useState<"create" | "join">("create");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [openToJoin, setOpenToJoin] = useState<OpenSlotToJoin[]>([]);
  const [myClaims, setMyClaims] = useState<MyClaimedSlot[]>([]);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);

  async function refreshListsNow() {
    if (!roundId) return;
    const [claims, openSlots] = await Promise.all([
      api.judge.myClaimedSlots(roundId),
      api.judge.openSlotsToJoin(roundId),
    ]);
    setMyClaims(claims);
    setOpenToJoin(openSlots);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadLists() {
      if (!roundId) return;
      const [claims, openSlots] = await Promise.all([
        api.judge.myClaimedSlots(roundId),
        api.judge.openSlotsToJoin(roundId),
      ]);
      if (cancelled) return;
      setMyClaims(claims);
      setOpenToJoin(openSlots);
    }

    void loadLists();
    return () => {
      cancelled = true;
    };
  }, [roundId]);

  async function claimSlot() {
    if (!roundId || !locationId || !date || !time) return;
    setClaimError(null);
    setBusy(true);
    try {
      const { id } = await api.judge.claimSlot({
        round_id: roundId,
        location_id: locationId,
        start_time: new Date(`${date}T${time}`).toISOString(),
      });
      setDate("");
      setTime("");
      await refreshListsNow();
      setActiveSlotId(id);
    } catch (e: unknown) {
      setClaimError(e instanceof Error ? e.message : "Failed to claim slot.");
    } finally {
      setBusy(false);
    }
  }

  async function joinSlot(slotId: number) {
    setBusy(true);
    try {
      await api.judge.joinSlot(slotId);
      await refreshListsNow();
      setActiveSlotId(slotId);
    } catch (e: unknown) {
      setClaimError(e instanceof Error ? e.message : "Failed to join slot.");
    } finally {
      setBusy(false);
    }
  }

  if (roundLoading) return <PageLoading />;
  if (!round) return <EmptyState title="No round active" />;

  if (activeSlotId) {
    return (
      <SlotWorkspace
        slotId={activeSlotId}
        roundId={round.id}
        onBack={() => {
          setActiveSlotId(null);
          void refreshListsNow();
        }}
        onClosed={() => {
          setActiveSlotId(null);
          void refreshListsNow();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Round 2 - Debates"
        subtitle="Create a new debate slot, or join an existing one as co-judge."
      />

      <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-4)" }}>
        <Button
          variant={tab === "create" ? "primary" : "secondary"}
          onClick={() => setTab("create")}
        >
          <Plus size={14} /> Create slot
        </Button>
        <Button
          variant={tab === "join" ? "primary" : "secondary"}
          onClick={() => setTab("join")}
        >
          <Users size={14} /> Join as co-judge{" "}
          {openToJoin.length > 0 && `(${openToJoin.length})`}
        </Button>
      </div>

      {tab === "create" && (
        <Card style={{ marginBottom: "var(--space-5)" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Select
              value={locationId ?? ""}
              onChange={(e) => setLocationId(Number(e.target.value))}
            >
              <option value="">Location…</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={inputStyle}
            />
            <Button
              variant="primary"
              onClick={claimSlot}
              disabled={!locationId || !date || !time || busy}
            >
              {busy ? "Claiming…" : "Claim this slot"}
            </Button>
          </div>
          {claimError && (
            <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>
              {claimError}
            </p>
          )}
        </Card>
      )}

      {tab === "join" && (
        <Card style={{ marginBottom: "var(--space-5)" }}>
          {openToJoin.length === 0 ? (
            <EmptyState
              title="Nothing to join"
              subtitle="No slots are currently waiting for a co-judge."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {openToJoin.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    background: "var(--bg-subtle)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {s.location_name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(s.start_time).toLocaleString()} · hosted by{" "}
                      {s.host_name}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => joinSlot(s.id)}
                    disabled={busy}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
          {claimError && (
            <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>
              {claimError}
            </p>
          )}
        </Card>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
        Your slots
      </h3>
      {myClaims.length === 0 ? (
        <EmptyState title="No slots yet" subtitle="Create or join one above." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myClaims.map((s) => (
            <Card key={s.id} style={{ cursor: "pointer" }}>
              <div
                onClick={() => setActiveSlotId(s.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{s.location_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(s.start_time).toLocaleString()}
                  </div>
                </div>
                <Badge tone="accent">
                  {s.filled_count}/{s.capacity} filled
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "9px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
};

// --- Slot workspace: attendance gate, then either scoring (host) or waiting (co-judge) ---

function SlotWorkspace({
  slotId,
  roundId,
  onBack,
  onClosed,
}: {
  slotId: number;
  roundId: number;
  onBack: () => void;
  onClosed: () => void;
}) {
  const [status, setStatus] = useState<CoJudgeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshStatusNow() {
    setStatus(await api.judge.coJudgeStatus(slotId));
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const next = await api.judge.coJudgeStatus(slotId);
      if (cancelled) return;
      setStatus(next);
      setLoading(false);
    }

    void loadStatus();
    const t = setInterval(() => {
      void (async () => {
        const next = await api.judge.coJudgeStatus(slotId);
        if (cancelled) return;
        setStatus(next);
        setLoading(false);
      })();
    }, 4000); // poll so the co-judge sees host's confirmation land live, and vice versa
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [slotId]);

  if (loading || !status) return <PageLoading />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={circleBtnStyle} title="Back">
            <ArrowLeft size={16} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Debate roster
          </h2>
        </div>
        {status.you_are_host && (
          <Button
            variant="danger"
            onClick={async () => {
              await api.judge.closeSlot(slotId);
              onClosed();
            }}
          >
            <X size={14} /> Close this debate
          </Button>
        )}
      </div>

      {!status.co_judge_id ? (
        <EmptyState title="Waiting for a co-judge" subtitle="..." />
      ) : !status.scoring_unlocked ? (
        <AttendanceGate
          status={status}
          slotId={slotId}
          onUpdated={refreshStatusNow}
        />
      ) : !status.scorer_chosen && status.you_are_host ? (
        <ScorerChoice
          status={status}
          slotId={slotId}
          onChosen={refreshStatusNow}
        />
      ) : !status.scorer_chosen ? (
        <Card>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Waiting for the host to decide who scores.
          </p>
        </Card>
      ) : status.you_are_scorer ? (
        <HostScoringPanel
          slotId={slotId}
          roundId={roundId}
          status={status}
          onMotionSaved={refreshStatusNow}
        />
      ) : (
        <Card>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            {status.scorer_name} is entering the scores. You&apos;re here as a bias
            check.
          </p>
        </Card>
      )}
    </div>
  );
}

const circleBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

function AttendanceGate({
  status,
  slotId,
  onUpdated,
}: {
  status: CoJudgeStatus;
  slotId: number;
  onUpdated: () => void;
}) {
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
        Confirm attendance
      </h3>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        Both judges need to confirm the other showed up before scoring unlocks.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span style={{ fontSize: 14 }}>{status.host_name} (host)</span>
          {status.you_are_co_judge ? (
            status.co_judge_marked_host_present ? (
              <Badge tone="success">Confirmed</Badge>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  await api.judge.markHostPresent(slotId);
                  onUpdated();
                }}
              >
                Mark present
              </Button>
            )
          ) : (
            <Badge
              tone={status.co_judge_marked_host_present ? "success" : "neutral"}
            >
              {status.co_judge_marked_host_present
                ? "Confirmed by co-judge"
                : "Waiting"}
            </Badge>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span style={{ fontSize: 14 }}>
            {status.co_judge_name} (co-judge)
          </span>
          {status.you_are_host ? (
            status.host_marked_co_judge_present ? (
              <Badge tone="success">Confirmed</Badge>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  await api.judge.markCoJudgePresent(slotId);
                  onUpdated();
                }}
              >
                Mark present
              </Button>
            )
          ) : (
            <Badge
              tone={status.host_marked_co_judge_present ? "success" : "neutral"}
            >
              {status.host_marked_co_judge_present
                ? "Confirmed by host"
                : "Waiting"}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function ScorerChoice({
  status,
  slotId,
  onChosen,
}: {
  status: CoJudgeStatus;
  slotId: number;
  onChosen: () => void;
}) {
  return (
    <Card>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
        Who should score this debate?
      </h3>
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="primary"
          onClick={async () => {
            await api.judge.setScorer(slotId, status.host_id);
            onChosen();
          }}
        >
          Myself
        </Button>
        {status.co_judge_id && (
          <Button
            variant="secondary"
            onClick={async () => {
              await api.judge.setScorer(slotId, status.co_judge_id!);
              onChosen();
            }}
          >
            {status.co_judge_name}
          </Button>
        )}
      </div>
    </Card>
  );
}

function HostScoringPanel({
  slotId,
  roundId,
  status,
  onMotionSaved,
}: {
  slotId: number;
  roundId: number;
  status: CoJudgeStatus;
  onMotionSaved: () => void;
}) {
  const [motion, setMotion] = useState(status.motion);
  const [participants, setParticipants] = useState<ParticipantView[]>([]);
  const [prepA, setPrepA] = useState(status.team_a_prep);
  const [prepB, setPrepB] = useState(status.team_b_prep);
  const [savedPrep, setSavedPrep] = useState(false);
  const [savedMotion, setSavedMotion] = useState(false);
  const savedMotionTimerRef = useRef<number | null>(null);

  async function loadParticipantsNow() {
    setParticipants(await api.judge.participants(slotId));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next = await api.judge.participants(slotId);
      if (!cancelled) setParticipants(next);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slotId]);

  useEffect(() => {
    return () => {
      if (savedMotionTimerRef.current !== null) {
        window.clearTimeout(savedMotionTimerRef.current);
      }
    };
  }, []);

  async function saveMotion() {
    await api.judge.setMotion(slotId, motion);
    onMotionSaved();
    setSavedMotion(true);
    if (savedMotionTimerRef.current !== null) {
      window.clearTimeout(savedMotionTimerRef.current);
    }
    savedMotionTimerRef.current = window.setTimeout(() => setSavedMotion(false), 3000);
  }

  async function setAttendance(id: number, attendance: "present" | "no_show") {
    await api.judge.setAttendance(id, attendance);
    await loadParticipantsNow();
  }
  async function setScore(id: number, score: number, comments: string) {
    await api.judge.setScore(id, score, comments);
    await loadParticipantsNow();
  }
  async function savePrep() {
    await api.judge.setTeamPrep(slotId, "A", prepA);
    await api.judge.setTeamPrep(slotId, "B", prepB);
    setSavedPrep(true);
    setTimeout(() => setSavedPrep(false), 2000);
  }

  return (
    <div>
      <Card style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}
        >
          Motion
        </label>
        <input
          value={motion}
          onChange={(e) => setMotion(e.target.value)}
          placeholder="e.g. This house believes..."
          style={{ ...textareaStyle, marginTop: 4 }}
        />
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            size="sm"
            variant="primary"
            onClick={saveMotion}
          >
            Save motion
          </Button>
          {savedMotion && (
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", background: "var(--success-soft)", borderRadius: "999px", padding: "4px 8px" }}>
              Saved ✓
            </span>
          )}
        </div>
      </Card>
      <Card style={{ marginBottom: "var(--space-4)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
          Prep strategy notes
        </h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              Team A
            </label>
            <textarea
              value={prepA}
              onChange={(e) => setPrepA(e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              Team B
            </label>
            <textarea
              value={prepB}
              onChange={(e) => setPrepB(e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={savePrep}
          style={{ marginTop: 8 }}
        >
          {savedPrep ? "Saved ✓" : "Save notes"}
        </Button>
      </Card>

      {participants.length === 0 ? (
        <EmptyState
          title="Slot isn't filled"
          subtitle="No candidates have been assigned to this debate yet."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {participants.map((p) => (
            <ParticipantRow
              key={p.id}
              p={p}
              roundId={roundId}
              onAttendance={setAttendance}
              onScore={setScore}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 4,
  padding: 9,
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  fontSize: 13,
};

function ParticipantRow({
  p,
  roundId,
  onAttendance,
  onScore,
}: {
  p: ParticipantView;
  roundId: number;
  onAttendance: (id: number, a: "present" | "no_show") => void;
  onScore: (id: number, score: number, comments: string) => void;
}) {
  const [score, setLocalScore] = useState(p.score && p.score > 0 ? p.score : 3);
  const [comments, setLocalComments] = useState(p.comments ?? "");
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null)
        window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 600 }}>
          {p.candidate_name || p.candidate_email}
        </div>
        <Badge tone="neutral">Team {p.team}</Badge>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <Button
          size="sm"
          variant={p.attendance === "present" ? "primary" : "secondary"}
          onClick={() => onAttendance(p.id, "present")}
        >
          Present
        </Button>
        <Button
          size="sm"
          variant={p.attendance === "no_show" ? "danger" : "secondary"}
          onClick={() => onAttendance(p.id, "no_show")}
        >
          No-show
        </Button>
      </div>
      {p.attendance === "present" && (
        <div style={{ marginTop: 14 }}>
          <PropertyScoring
            roundId={roundId}
            kind="participant"
            targetId={p.id}
            overall={score}
            onOverallChange={setLocalScore}
          />
          <textarea
            value={comments}
            onChange={(e) => setLocalComments(e.target.value)}
            placeholder="Comments"
            rows={2}
            style={textareaStyle}
          />
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Button
              size="sm"
              variant="primary"
              onClick={async () => {
                await onScore(p.id, score, comments);
                setSaved(true);
                if (savedTimerRef.current !== null)
                  window.clearTimeout(savedTimerRef.current);
                savedTimerRef.current = window.setTimeout(
                  () => setSaved(false),
                  3000,
                );
              }}
            >
              Save
            </Button>
            {saved && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--success)",
                  background: "var(--success-soft)",
                  borderRadius: "999px",
                  padding: "4px 8px",
                }}
              >
                Saved ✓
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
