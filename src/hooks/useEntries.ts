import { getPreferenceValues } from '@raycast/api';
import { useFetch } from "@raycast/utils";
import { useState, useMemo, useEffect } from "react";

import { EntryType, FilterType, IPreferences } from "../types";
import { entryDecorator, formattedSelectedDay } from "../utils";

type State = {
  filter: FilterType;
  entries: EntryType[];
}

const useEntries = () =>{
  const { userId, personalAccessToken } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    filter: FilterType.Today,
    entries: [],
  });

  const filterByDay = useMemo(() => formattedSelectedDay(state.filter), [state.filter]);

  const { data, isLoading } = useFetch<EntryType[]>(`https://api.nokotime.com/v2/entries?user_ids=${userId}&from=${filterByDay}&to=${filterByDay}`, {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!data) { return; }

    setState({
      filter: state.filter,
      entries: entryDecorator(data),
    });
  }, [data]);

  return {
    ...state,
    isLoading,
    setState,
  };
}

export default useEntries;
