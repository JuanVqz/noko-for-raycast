import { getPreferenceValues } from '@raycast/api';
import { useFetch } from "@raycast/utils";
import { useState } from "react";

import { Entry, IPreferences } from "../types";

type State = {
  isLoading: boolean;
  entries: Entry[];
}

export function useEntries() {
  const { userId, personalAccessToken } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    isLoading: true,
    entries: [],
  });

  const today = () => {
    const date = new Date();

    return date.toISOString().split('T')[0];
  }

  const convertMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  useFetch(`https://api.nokotime.com/v2/entries?user_ids=${userId}&from=${today()}&to=${today()}`, {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onData: (entries: Entry[]) => {
      setState({
        isLoading: false,
        entries: entries.map((entry) => ({ ...entry, formatted_minutes: convertMinutesToHours(entry.minutes) }))
      });
    },
    keepPreviousData: true,
  });

  return state;
}
