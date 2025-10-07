import { getPreferenceValues } from "@raycast/api";
import { useState, useMemo, useEffect } from "react";

import { EntryDateEnum, IPreferences } from "../types";
import { entryDecorator, formattedDate } from "../utils";
import { useEntries as useEntriesApi } from "./useNokoApi";

type State = {
  filter: EntryDateEnum;
  entries: any[];
};

const useEntries = () => {
  const { userId } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    filter: EntryDateEnum.Today,
    entries: [],
  });

  const filterByDay = useMemo(
    () => formattedDate(state.filter),
    [state.filter],
  );

  const { data, isLoading, error } = useEntriesApi(
    `user_ids=${userId}&from=${filterByDay}&to=${filterByDay}`,
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    console.log("data", data);

    setState((prevState) => ({
      ...prevState,
      entries: entryDecorator(data),
    }));
  }, [data]);

  return {
    ...state,
    isLoading,
    error,
    setState,
  };
};

export default useEntries;
