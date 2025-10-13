// ============================================================================
// PREFERENCES & CONFIGURATION
// ============================================================================

interface IPreferences {
  personalAccessToken: string;
  timezone?: string;
}

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

type ApprovedByType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
};

type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
};

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

type TagType = {
  id: string;
  name: string;
  formatted_name: string;
};

type ProjectType = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  billing_increment?: number;
  timer: TimerType | TimerNullType;
};

type EntryType = {
  id: string;
  date: string;
  billable: boolean;
  minutes: number;
  formatted_minutes: string;
  description: string;
  approved_by: ApprovedByType | null;
  approved_at: string;
  user: UserType;
  tags: TagType[];
  project: ProjectType;
};

// ============================================================================
// ENUMS
// ============================================================================

export enum EntryDateEnum {
  Yesterday = "Yesterday",
  Today = "Today",
  Tomorrow = "Tomorrow",
}

export enum TimerStateEnum {
  Running = "running",
  Paused = "paused",
}

// ============================================================================
// TIMER TYPES
// ============================================================================

// API response type (includes project data from API)
type TimerApiResponse = {
  id: string;
  state: TimerStateEnum;
  date: string;
  seconds: number;
  formatted_time: string;
  description: string;
  user: UserType;
  project: ProjectType;
  url: string;
  start_url: string;
  pause_url: string;
  add_or_subtract_time_url: string;
  log_url: string;
  log_inbox_entry_url: string;
};

type TimerType = {
  id: string;
  state: TimerStateEnum;
  date: string;
  seconds: number;
  url: string;
  start_url: string;
  pause_url: string;
  add_or_subtract_time_url: string;
  log_url: string;
  log_inbox_entry_url: string;
};

type TimerNullType = {
  id: "";
  state: TimerStateEnum.Paused;
  date: "";
  seconds: 0;
  url: "";
  start_url: "";
  pause_url: "";
  add_or_subtract_time_url: "";
  log_url: "";
  log_inbox_entry_url: "";
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

// API Response wrapper
type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// Form data types
type EntryFormData = {
  minutes: string;
  project_name: string;
  description: string;
  tags: string[];
  date: Date;
};

// Component prop types
type ViewType = "timers" | "add-entry" | "entries";

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // Core entities
  EntryType,
  TimerType,
  TimerApiResponse,
  TimerNullType,
  IPreferences,
  UserType,
  ApprovedByType,
  TagType,
  ProjectType,
  // Utility types
  ApiResponse,
  EntryFormData,
  ViewType,
};
