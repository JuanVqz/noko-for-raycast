import { getPreferenceValues } from "@raycast/api";
import {
  EntryType,
  EntryDateEnum,
  TimerType,
  TimerStateEnum,
  UserType,
  IPreferences,
} from "./types";

const hoursFormat = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(remainingMinutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
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
    return timer.formatted_time;
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

export {
  entryDecorator,
  formattedFilterDate,
  formatTime,
  getElapsedTime,
  userName,
  formatTags,
  dateOnTimezone,
};
