import { getPreferenceValues } from '@raycast/api';
import { useFetch } from "@raycast/utils";
import { useCallback, useState } from "react";

import { Entry, Filter, IPreferences } from "../types";
import { entryDecorator } from "../utils";

type State = {
  isLoading: boolean;
  filter: Filter;
  entries: Entry[];
}

export function useEntries() {
  const { userId, personalAccessToken } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    isLoading: true,
    filter: Filter.Today,
    entries: [],
  });

  const filteredByDay = useCallback(() => {
    const date = new Date();

    if (state.filter === Filter.Yesterday) {
      return new Date(date.setDate(date.getDate() - 1)).toISOString().split('T')[0];
    }

    if (state.filter === Filter.Tomorrow) {
      return new Date(date.setDate(date.getDate() + 1)).toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];
  }, [state.filter]);

  useFetch(`https://api.nokotime.com/v2/entries?user_ids=${userId}&from=${filteredByDay()}&to=${filteredByDay()}`, {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onData: (response: Entry[]) => {
      setState({
        isLoading: false,
        filter: state.filter,
        entries: entryDecorator(response)
      });
    },
    keepPreviousData: true,
  });

  return {
    ...state,
    setState,
  };
}
