import { EntryType, EntriesSummaryType, WeekSummaryType } from "../types";
import { hoursFormat } from "./time-utils";

export const calculateEntrySummary = (entries: EntryType[]) => {
  if (!entries.length) {
    return {
      totalMinutes: 0,
      billableMinutes: 0,
      unbillableMinutes: 0,
      entryCount: 0,
      totalFormatted: "00:00",
      billableFormatted: "00:00",
      unbillableFormatted: "00:00",
    };
  }

  const result = entries.reduce(
    (acc, entry) => {
      acc.totalMinutes += entry.minutes;
      if (entry.billable) {
        acc.billableMinutes += entry.minutes;
      }
      return acc;
    },
    { totalMinutes: 0, billableMinutes: 0 },
  );

  const unbillableMinutes = result.totalMinutes - result.billableMinutes;
  const entryCount = entries.length;

  return {
    totalMinutes: result.totalMinutes,
    billableMinutes: result.billableMinutes,
    unbillableMinutes,
    entryCount,
    totalFormatted: hoursFormat(result.totalMinutes),
    billableFormatted: hoursFormat(result.billableMinutes),
    unbillableFormatted: hoursFormat(unbillableMinutes),
  };
};

export const entryDecorator = (entries: EntryType[]) => {
  return entries.map((entry) => ({
    ...entry,
    formatted_minutes: hoursFormat(entry.minutes),
  }));
};

const buildSummaryStrings = (summary: ReturnType<typeof calculateEntrySummary>, prefix: string) => {
  const billablePercentage =
    summary.totalMinutes > 0
      ? Math.round((summary.billableMinutes / summary.totalMinutes) * 100)
      : 0;

  return {
    title: `${prefix} ${summary.totalFormatted} • Billable ${summary.billableFormatted} • Unbillable ${summary.unbillableFormatted}`,
    subtitle: `${summary.entryCount} ${summary.entryCount === 1 ? "entry" : "entries"} • ${billablePercentage}% billable`,
  };
};

export const getEntriesSummary = (entries: EntryType[]): EntriesSummaryType => {
  const summary = calculateEntrySummary(entries);
  const { title, subtitle } = buildSummaryStrings(summary, "Total");

  return {
    title,
    subtitle,
    exists: entries.length > 0,
    billable: summary.billableFormatted,
    unbillable: summary.unbillableFormatted,
  };
};

export const getWeekSummary = (entries: EntryType[]): WeekSummaryType => {
  if (!entries.length) {
    return { title: "", subtitle: "", exists: false, totalFormatted: "", billable: "", unbillable: "" };
  }

  const summary = calculateEntrySummary(entries);
  const { title, subtitle } = buildSummaryStrings(summary, "Week");

  return {
    title,
    subtitle,
    exists: true,
    totalFormatted: summary.totalFormatted,
    billable: summary.billableFormatted,
    unbillable: summary.unbillableFormatted,
  };
};
