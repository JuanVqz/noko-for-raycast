import { getPreferenceValues } from '@raycast/api';
import { useFetch } from "@raycast/utils";
import { useState } from "react";

import { Entry, Preferences } from "../types";

type State = {
  isLoading: boolean;
  entries: Entry[];
}

export function useEntries() {
  const { personalAccessToken } = getPreferenceValues<Preferences>();

  const [state, setState] = useState<State>({
    isLoading: true,
    entries: [],
  });

  useFetch("https://api.nokotime.com/v2/entries?from=2024-10-04", {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onData: (data: Entry[]) => {
      setState({ isLoading: false, entries: data });
    },
    keepPreviousData: true,
  });

  return state;
}
