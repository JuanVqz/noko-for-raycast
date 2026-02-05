import { TimerType, TimerStateEnum } from "../types";

export const hoursFormat = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(remainingMinutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
};

export const formatMinutesAsTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

export const parseTimeInput = (timeString: string): number => {
  const trimmed = timeString.trim();

  if (trimmed === "") {
    throw new Error(
      "Time is required. Enter time in h:mm format (e.g., 1:30) or minutes (e.g., 90)",
    );
  }

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

  const numValue = parseFloat(trimmed);
  if (isNaN(numValue)) {
    throw new Error(
      "Invalid time format. Use h:mm (e.g., 1:30) or minutes (e.g., 90)",
    );
  }

  return numValue;
};

export const convertElapsedTimeToMinutes = (
  elapsedTimeString: string,
): number => {
  const parts = elapsedTimeString.split(":").map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 60 + minutes + Math.round(seconds / 60);
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes + Math.round(seconds / 60);
  }
  return 0;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const getElapsedTime = (
  timer: TimerType,
  currentTime: Date,
  fetchTime: Date,
): string => {
  if (timer.state !== TimerStateEnum.Running) {
    return formatTime(timer.seconds);
  }

  const now = currentTime.getTime();
  const timeSinceLastFetch = Math.floor((now - fetchTime.getTime()) / 1000);
  const currentElapsedSeconds = timer.seconds + timeSinceLastFetch;

  return formatTime(currentElapsedSeconds);
};
