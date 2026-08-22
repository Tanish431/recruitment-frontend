export type Role = "candidate" | "judge" | "admin";

export interface User {
  id: number;
  campus_email: string;
  name: string;
  phone: string;
  whatsapp: string;
  role: Role;
  round1_result?: "advanced" | "eliminated" | null;
  round2_result?: "advanced" | "eliminated" | null;
  round1_result_seen: boolean;
  round2_result_seen: boolean;
  created_at: string;
}

export interface AssignmentView {
  assignment_id: number;
  status: "confirmed" | "pending_query" | "reassigned";
  round_number: number;
  location_name: string;
  start_time: string;
  duration_min: number;
  team?: "A" | "B" | null;
  query_id?: number | null;
  query_status?: "pending" | "resolved" | null;
}

export interface UnavailabilityEntry {
  round_number: number;
  unavailable_dates: string[];
  note: string;
  submitted_at: string;
  reason: string;
}

export interface SlotView {
  id: number;
  location_id: number;
  location_name: string;
  start_time: string;
  duration_min: number;
  capacity: number;
  filled_count: number;
  hosted_by_name?: string;
  hosted_by_id?: number;
}

export interface AssignmentBoardView {
  assignment_id: number;
  candidate_id: number;
  candidate_email: string;
  candidate_name: string;
  slot_id: number;
  slot_start: string;
  location_name: string;
  status: string;
  team?: "A" | "B" | null;
}

export interface PendingQueryView {
  query_id: number;
  assignment_id: number;
  candidate_id: number;
  candidate_email: string;
  reason: string;
  round_number: number;
  location_name: string;
  start_time: string;
}

export interface JudgeStationView {
  judge_id: number;
  judge_email: string;
  location_id: number;
  location_name: string;
}

export interface GenerateScheduleResult {
  required_capacity: number;
  slots_created: number;
  days: string[];
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors?: string[];
}

export interface QueueItem {
  evaluation_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  slot_id: number;
  slot_start: string;
  status: "not_arrived" | "checked_in" | "in_progress" | "completed" | "no_show" | "skipped";
  checked_in_at?: string | null;
  skip_count: number;
}

export interface AvailableSlot {
  id: number;
  location_id: number;
  location_name: string;
  start_time: string;
  duration_min: number;
}

export interface ParticipantView {
  id: number;
  candidate_name: string;
  candidate_id: number;
  candidate_email: string;
  team: "A" | "B";
  attendance: "pending" | "present" | "no_show";
  score?: number | null;
  comments?: string | null;
}

export interface AdminUnavailabilityView {
  candidate_name: string;
  candidate_email: string;
  unavailable_dates: string[];
  note: string;
  submitted_at: string;
  reason: string;
}

export interface Round {
  id: number;
  number: number;
  name: string;
  slot_creation_open: boolean;
  is_active: boolean;
}

export interface Location {
  id: number;
  name: string;
}

export interface CheckInLookupResult {
  evaluation_id: number;
  candidate_id: number;
  status: string;
  location_name: string;
  slot_start: string;
}

export interface CandidateListItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  round1_result: string;
  round2_result: string;
}

export interface PaginatedCandidates {
  candidates: CandidateListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface UnassignedCandidate {
  id: number;
  name: string;
  email: string;
}

export interface PendingQueryView {
  query_id: number;
  assignment_id: number;
  slot_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  reason: string;
  round_id: number;
  round_number: number;
  location_name: string;
  start_time: string;
}

export interface OpenSlotOption {
  id: number;
  location_name: string;
  start_time: string;
  free_capacity: number;
}

export interface OtherAssignmentOption {
  assignment_id: number;
  candidate_name: string;
  candidate_email: string;
  location_name: string;
  start_time: string;
}

export interface MyClaimedSlot {
  id: number;
  location_name: string;
  start_time: string;
  filled_count: number;
  capacity: number;
}

export interface ScoringProperty {
  id: number;
  name: string;
  position: number;
}
export type PropertyRating = "bad" | "meh" | "good";

export interface OpenSlotToJoin {
  id: number;
  location_name: string;
  start_time: string;
  host_name: string;
  judges_joined: number;
  judges_needed: number;
}

export interface CoJudgeStatus {
  slot_id: number;
  host_id: number;
  host_name: string;
  co_judge_id?: number;
  co_judge_name?: string;
  host_marked_co_judge_present: boolean;
  co_judge_marked_host_present: boolean;
  you_are_host: boolean;
  you_are_co_judge: boolean;
  scoring_unlocked: boolean;
  scorer_judge_id: number;
  scorer_name: string;
  scorer_chosen: boolean;
  you_are_scorer: boolean;
  team_a_prep: string;
  team_b_prep: string;
  motion: string;
}

export interface SlotJudgeInfo { id: number; name: string; }
export interface SlotJudgesResponse { host: SlotJudgeInfo; co_judges: SlotJudgeInfo[]; }

export interface ResultsTableRow {
  candidate_id: number;
  name: string;
  email: string;
  overall?: number;
  properties: Record<number, "bad" | "meh" | "good">;
}
export interface ResultsTableView {
  properties: { id: number; name: string; position: number }[];
  rows: ResultsTableRow[];
}
export interface CandidateRoundSummary {
  round_number: number;
  status: string;
  overall?: number;
  comments: string;
  motion?: string;
  team?: string;
  team_a_prep?: string;
  team_b_prep?: string;
  properties: Record<string, "bad" | "meh" | "good">;
}
export interface CandidateSummaryView {
  candidate_id: number;
  name: string;
  email: string;
  rounds: CandidateRoundSummary[];
}
