import { getPreferenceValues } from "@raycast/api";
import { EntryDateEnum, IPreferences } from "../types";

export const dateOnTimezone = (date: Date): string => {
  const { timezone } = getPreferenceValues<IPreferences>();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
};

export const formattedFilterDate = (filter: EntryDateEnum): string => {
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
