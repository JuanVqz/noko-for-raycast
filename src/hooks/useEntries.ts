import { getPreferenceValues } from '@raycast/api';
import { useFetch } from "@raycast/utils";
import { useState } from "react";

import { Entry, IPreferences } from "../types";
import { entryDecorator } from "../utils";

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

  useFetch(`https://api.nokotime.com/v2/entries?user_ids=${userId}&from=${today()}&to=${today()}`, {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onData: (response: Entry[]) => {
      setState({
        isLoading: false,
        entries: entryDecorator(response)
      });
    },
    keepPreviousData: true,
  });

  return state;
}
