const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

import type {
  User,
  AssignmentView,
  UnavailabilityEntry,
  SlotView,
  AssignmentBoardView,
  PendingQueryView,
  JudgeStationView,
  GenerateScheduleResult,
  ImportResult,
  QueueItem,
  AvailableSlot,
  ParticipantView,
  AdminUnavailabilityView,
  CheckInLookupResult,
  Round,
  Location,
  PaginatedCandidates,
  UnassignedCandidate,
  OpenSlotOption,
  OtherAssignmentOption,
  MyClaimedSlot,
} from "./types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // sends the session_id cookie
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text || res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}
function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

function normalizeGenerateScheduleResult(
  raw: Record<string, unknown>,
): GenerateScheduleResult {
  const slotsCreated = Object.entries(raw).reduce((total, [key, value]) => {
    if (
      key === "required_capacity" ||
      !key.endsWith("_slots_created") ||
      typeof value !== "number"
    ) {
      return total;
    }
    return total + value;
  }, 0);

  const days = Object.entries(raw).reduce<string[]>((allDays, [key, value]) => {
    if (!key.endsWith("_days") || !Array.isArray(value)) return allDays;

    const nextDays = value.filter(
      (day): day is string => typeof day === "string",
    );
    return [...allDays, ...nextDays];
  }, []);

  return {
    required_capacity:
      typeof raw.required_capacity === "number" ? raw.required_capacity : 0,
    slots_created: slotsCreated,
    days: [...new Set(days)].sort((a, b) => a.localeCompare(b)),
  };
}

export const api = {
  // ---------- Auth ----------
  auth: {
    loginUrl: () => `${API_URL}/auth/login`,
    logout: () => post<void>("/auth/logout"),
    me: () => get<User>("/me"),
    updateProfile: (phone: string, whatsapp: string) =>
      patch<void>("/me/profile", { phone, whatsapp }),
  },

  rounds: {
    list: () => get<Round[]>("/rounds"),
    active: async (): Promise<Round | null> => {
      try {
        return await get<Round>("/rounds/active");
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  },

  // ---------- Candidate ----------
  candidate: {
    myAssignments: () => get<AssignmentView[]>("/me/assignment"),
    raiseQuery: (assignmentId: number, reason: string) =>
      post<{ query_id: number }>("/me/queries", {
        assignment_id: assignmentId,
        reason,
      }),
    submitUnavailability: (
      roundId: number,
      unavailableDates: string[],
      note?: string,
    ) =>
      post<void>("/me/unavailability", {
        round_id: roundId,
        unavailable_dates: unavailableDates,
        note,
      }),
    myUnavailability: () => get<UnavailabilityEntry[]>("/me/unavailability"),
    cancelQuery: (queryId: number) => del<void>(`/me/queries/${queryId}`),
  },

  // ---------- Admin ----------
  admin: {
    importCandidatesCsv: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<ImportResult>("/admin/candidates/import", {
        method: "POST",
        body: form,
      });
    },
    importFromSheet: () =>
      post<ImportResult>("/admin/candidates/import-from-sheet"),

    createSlot: (input: {
      round_id: number;
      location_id: number;
      start_time: string;
      duration_min: number;
      capacity: number;
    }) => post<{ id: number }>("/admin/slots", input),

    listSlots: (roundId: number) =>
      get<SlotView[]>(`/admin/slots?round_id=${roundId}`),

    deleteSlot: (slotId: number) => del<void>(`/admin/slots/${slotId}`),

    promoteToJudge: (email: string) =>
      post<void>("/admin/judges/promote", { email }),

    assignJudgeStation: (
      judgeId: number,
      locationId: number,
      roundId: number,
    ) =>
      post<void>("/admin/judge-stations", {
        judge_id: judgeId,
        location_id: locationId,
        round_id: roundId,
      }),
    searchUsers: (q: string, role?: string) =>
      get<
        {
          id: number;
          name: string;
          email: string;
          role: string;
          round1_result: string;
          round2_result: string;
        }[]
      >(
        `/admin/users/search?q=${encodeURIComponent(q)}${role ? `&role=${role}` : ""}`,
      ),
    listJudgeStations: (roundId: number) =>
      get<JudgeStationView[]>(`/admin/judge-stations?round_id=${roundId}`),

    runAssignment: (roundId: number, groupSize: number) =>
      post<{
        pool_size: number;
        groups_formed: number;
        slots_filled: number;
        unplaced: number;
        warnings?: string[];
      }>(`/admin/rounds/${roundId}/assign`, { group_size: groupSize }),

    listAssignments: (roundId: number) =>
      get<AssignmentBoardView[]>(`/admin/rounds/${roundId}/assignments`),

    moveAssignment: (assignmentId: number, newSlotId: number) =>
      post<void>(`/admin/assignments/${assignmentId}/move`, {
        new_slot_id: newSlotId,
      }),

    swapAssignments: (assignmentAId: number, assignmentBId: number) =>
      post<void>("/admin/assignments/swap", {
        assignment_a_id: assignmentAId,
        assignment_b_id: assignmentBId,
      }),

    listPendingQueries: () => get<PendingQueryView[]>("/admin/queries"),

    resolveQuery: (
      queryId: number,
      input:
        | { resolution: "swap"; swap_with_assignment_id: number; note?: string }
        | { resolution: "reassign"; new_slot_id: number; note?: string },
    ) => post<void>(`/admin/queries/${queryId}/resolve`, input),

    listUnavailability: (roundId: number) =>
      get<AdminUnavailabilityView[]>(`/admin/rounds/${roundId}/unavailability`),
    toggleSlotCreation: (roundId: number, open: boolean) =>
      post<void>(`/admin/rounds/${roundId}/toggle-slot-creation`, { open }),
    listLocations: (roundId: number) =>
      get<Location[]>(`/admin/locations?round_id=${roundId}`),
    createLocation: (roundId: number, name: string) =>
      post<{ id: number }>("/admin/locations", { round_id: roundId, name }),
    listCandidates: (page: number, round?: "1" | "2" | "3") =>
      get<PaginatedCandidates>(
        `/admin/candidates?page=${page}${round ? `&round=${round}` : ""}`,
      ),
    unassignCandidate: (assignmentId: number) =>
      del<void>(`/admin/assignments/${assignmentId}/unassign`),
    addCandidateToSlot: (slotId: number, candidateId: number) =>
      post<{ unavailability_conflict: boolean }>(
        `/admin/slots/${slotId}/candidates`,
        { candidate_id: candidateId },
      ),
    syncRoundResults: (roundId: number) =>
      post<{ updated: number; skipped: number }>(
        `/admin/rounds/${roundId}/sync-results`,
      ),
    openSlotsForRound: (roundId: number) =>
      get<OpenSlotOption[]>(`/admin/queries/open-slots?round_id=${roundId}`),
    otherAssignmentsForRound: (roundId: number, excludeAssignmentId: number) =>
      get<OtherAssignmentOption[]>(
        `/admin/queries/other-assignments?round_id=${roundId}&exclude_assignment_id=${excludeAssignmentId}`,
      ),
    listUnassignedCandidates: (roundId: number) =>
      get<UnassignedCandidate[]>(
        `/admin/rounds/${roundId}/unassigned-candidates`,
      ),
    cancelQuery: (queryId: number) => del<void>(`/admin/queries/${queryId}`),
    updateSlotCapacity: (slotId: number, capacity: number) =>
      patch<void>(`/admin/slots/${slotId}/capacity`, { capacity }),
    generateSchedule: (input: {
      round_id: number;
      location_id: number;
      start_date: string;
      end_date: string;
      weekday: {
        start_time: string;
        end_time: string;
        break_start?: string;
        break_end?: string;
      };
      weekend: {
        start_time: string;
        end_time: string;
        break_start?: string;
        break_end?: string;
      };
      duration_min: number;
      capacity: number;
      timezone?: string;
    }) =>
      post<Record<string, unknown>>(
        "/admin/slots/generate-schedule",
        input,
      ).then(normalizeGenerateScheduleResult),
    activateRound: (roundId: number) =>
      post<void>(`/admin/rounds/${roundId}/activate`),
    deactivateRounds: () => post<void>("/admin/rounds/deactivate"),
  },

  // ---------- Judge ----------
  judge: {
    claimSlot: (input: {
      round_id: number;
      location_id: number;
      start_time: string;
      duration_min?: number;
    }) => post<{ id: number }>("/judge/slots/claim", input),

    availableSlots: (roundId: number) =>
      get<AvailableSlot[]>(`/judge/slots/available?round_id=${roundId}`),

    queue: (roundId: number) =>
      get<QueueItem[]>(`/judge/queue?round_id=${roundId}`),

    checkIn: (evaluationId: number) =>
      post<void>(`/judge/evaluations/${evaluationId}/checkin`),

    claim: (evaluationId: number) =>
      post<void>(`/judge/evaluations/${evaluationId}/claim`),

    submit: (evaluationId: number, score: number, comments: string) =>
      post<void>(`/judge/evaluations/${evaluationId}/submit`, {
        score,
        comments,
      }),

    lookupByEmail: (roundId: number, email: string) =>
      get<CheckInLookupResult>(
        `/judge/lookup?round_id=${roundId}&email=${encodeURIComponent(email)}`,
      ),
    myClaimedSlots: (roundId: number) =>
      get<MyClaimedSlot[]>(`/judge/slots/my-claimed?round_id=${roundId}`),
    skip: (evaluationId: number) =>
      post<void>(`/judge/evaluations/${evaluationId}/skip`),

    noShow: (evaluationId: number) =>
      post<void>(`/judge/evaluations/${evaluationId}/noshow`),

    participants: (slotId: number) =>
      get<ParticipantView[]>(`/judge/slots/${slotId}/participants`),

    setAttendance: (participantId: number, attendance: "present" | "no_show") =>
      post<void>(`/judge/participants/${participantId}/attendance`, {
        attendance,
      }),

    setScore: (participantId: number, score: number, comments: string) =>
      post<void>(`/judge/participants/${participantId}/score`, {
        score,
        comments,
      }),
  },
};

export { ApiError };
