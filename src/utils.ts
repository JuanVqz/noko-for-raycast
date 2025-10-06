import { EntryType, FilterType } from "./types";

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

// Returns the date in 'YYYY-MM-DD' format
const dateFormat = (date: Date): string => date.toISOString().split("T")[0];

const formattedDate = (filter: FilterType): string => {
  const today = new Date();

  if (filter === FilterType.Yesterday) {
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    return dateFormat(yesterday);
  }

  if (filter === FilterType.Tomorrow) {
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    return dateFormat(tomorrow);
  }

  return dateFormat(today);
};

export { entryDecorator, formattedDate };
