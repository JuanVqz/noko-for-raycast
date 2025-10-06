import { getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useMemo, useEffect } from "react";

import { EntryType, EntryDateEnum, IPreferences } from "../types";
import { entryDecorator, formattedDate } from "../utils";

type State = {
  filter: EntryDateEnum;
  entries: EntryType[];
};

const useEntries = () => {
  const { userId, personalAccessToken } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    filter: EntryDateEnum.Today,
    entries: [],
  });

  const filterByDay = useMemo(
    () => formattedDate(state.filter),
    [state.filter],
  );

  const { data, isLoading } = useFetch<EntryType[]>(
    `https://api.nokotime.com/v2/entries?user_ids=${userId}&from=${filterByDay}&to=${filterByDay}`,
    {
      headers: {
        "X-NokoToken": personalAccessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!data) {
      return;
    }

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
};

export default useEntries;
