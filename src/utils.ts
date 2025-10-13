import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import {
  EntryType,
  EntryDateEnum,
  TimerType,
  TimerNullType,
  TimerStateEnum,
  UserType,
  IPreferences,
  ProjectType,
} from "./types";
import { TIMER_STATE_PRIORITIES } from "./constants";

// ============================================================================
// TIME FORMATTING UTILITIES
// ============================================================================

const hoursFormat = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(remainingMinutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
};

const formatMinutesAsTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

const parseTimeInput = (timeString: string): number => {
  const trimmed = timeString.trim();

  if (trimmed === "") {
    throw new Error(
      "Time is required. Enter time in h:mm format (e.g., 1:30) or minutes (e.g., 90)",
    );
  }

  // Handle h:mm format (e.g., "1:30", "0:45")
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (isNaN(hours) || isNaN(minutes) || minutes >= 60) {
        throw new Error("Invalid time format. Use h:mm (e.g., 1:30)");
      }

      return hours * 60 + minutes;
    }
  }

  // Handle numeric format (e.g., "90" for 90 minutes)
  const numValue = parseFloat(trimmed);
  if (isNaN(numValue)) {
    throw new Error(
      "Invalid time format. Use h:mm (e.g., 1:30) or minutes (e.g., 90)",
    );
  }

  return numValue;
};

const convertElapsedTimeToMinutes = (elapsedTimeString: string): number => {
  // Parse elapsed time string like "1:23:45" or "23:45" to minutes
  const parts = elapsedTimeString.split(":").map(Number);
  if (parts.length === 3) {
    // HH:MM:SS format (when hours > 0)
    const [hours, minutes, seconds] = parts;
    return hours * 60 + minutes + Math.round(seconds / 60);
  } else if (parts.length === 2) {
    // MM:SS format (when hours = 0)
    const [minutes, seconds] = parts;
    return minutes + Math.round(seconds / 60);
  }
  return 0;
};

const entryDecorator = (entries: EntryType[]) => {
  return entries.map((entry) => ({
    ...entry,
    formatted_minutes: hoursFormat(entry.minutes),
  }));
};

const dateOnTimezone = (date: Date): string => {
  const { timezone } = getPreferenceValues<IPreferences>();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
};

const formattedFilterDate = (filter: EntryDateEnum): string => {
  const today = new Date();

  if (filter === EntryDateEnum.Yesterday) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return dateOnTimezone(yesterday);
  }

  if (filter === EntryDateEnum.Tomorrow) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return dateOnTimezone(tomorrow);
  }

  return dateOnTimezone(today);
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getElapsedTime = (
  timer: TimerType,
  currentTime: Date,
  fetchTime: Date,
): string => {
  if (timer.state !== TimerStateEnum.Running) {
    return formatTime(timer.seconds);
  }

  // For running timers, calculate the current elapsed time
  // The API returns the total seconds since the timer started
  // We need to add the time that has passed since the last fetch
  const now = currentTime.getTime();
  const timeSinceLastFetch = Math.floor((now - fetchTime.getTime()) / 1000);
  const currentElapsedSeconds = timer.seconds + timeSinceLastFetch;

  return formatTime(currentElapsedSeconds);
};

const userName = (user: UserType | null | undefined): string => {
  if (!user?.first_name || !user?.last_name || !user?.email) {
    return "";
  }
  return `${user.first_name} ${user.last_name} <${user.email}>`;
};

const formatTags = (
  tags: Array<{ formatted_name: string }> | null | undefined,
): string => {
  if (!tags || tags.length === 0) {
    return "";
  }
  return tags.map((tag) => tag.formatted_name).join(", ");
};

// ============================================================================
// TOAST UTILITIES
// ============================================================================

const showSuccessToast = (title: string, message: string) => {
  showToast({
    style: Toast.Style.Success,
    title,
    message,
  });
};

const showErrorToast = (title: string, message: string) => {
  showToast({
    style: Toast.Style.Failure,
    title,
    message,
  });
};

// ============================================================================
// DESCRIPTION UTILITIES
// ============================================================================

const combineDescriptionAndTags = (
  description: string,
  tags: string[],
): string => {
  return description.concat(" ", tags.join(" ")).trim();
};

// ============================================================================
// TIMER SORTING UTILITIES
// ============================================================================

const getTimerStatePriority = (state: TimerStateEnum | null): number => {
  if (state === TimerStateEnum.Running) return TIMER_STATE_PRIORITIES.RUNNING;
  if (state === TimerStateEnum.Paused) return TIMER_STATE_PRIORITIES.PAUSED;
  return TIMER_STATE_PRIORITIES.NULL;
};

const sortProjectsByTimerState = (a: ProjectType, b: ProjectType): number => {
  const aState = isTimerNull(a.timer) ? null : a.timer.state;
  const bState = isTimerNull(b.timer) ? null : b.timer.state;

  const aPriority = getTimerStatePriority(aState);
  const bPriority = getTimerStatePriority(bState);

  // Sort by priority first
  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  // Then alphabetically for same priority
  return a.name.localeCompare(b.name);
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Constant TimerNullType object for better performance and consistency
const TIMER_NULL: TimerNullType = {
  id: "",
  state: TimerStateEnum.Paused,
  date: "",
  seconds: 0,
  url: "",
  start_url: "",
  pause_url: "",
  add_or_subtract_time_url: "",
  log_url: "",
  log_inbox_entry_url: "",
} as const;

// Helper function to return the constant TimerNullType object
const createTimerNull = (): TimerNullType => TIMER_NULL;

// Helper function to check if a timer is null (using Null Object pattern)
const isTimerNull = (
  timer: TimerType | TimerNullType,
): timer is TimerNullType => {
  return timer.id === "";
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Time utilities
  entryDecorator,
  formattedFilterDate,
  formatTime,
  getElapsedTime,
  formatMinutesAsTime,
  parseTimeInput,
  convertElapsedTimeToMinutes,
  // User utilities
  userName,
  formatTags,
  // Date utilities
  dateOnTimezone,
  // Timer utilities
  createTimerNull,
  isTimerNull,
  getTimerStatePriority,
  sortProjectsByTimerState,
  // Toast utilities
  showSuccessToast,
  showErrorToast,
  // Description utilities
  combineDescriptionAndTags,
};
