import { getPreferenceValues } from "@raycast/api";
import { useState, useMemo, useEffect } from "react";

import { EntryDateEnum, IPreferences, EntryType } from "../types";
import { entryDecorator, formattedFilterDate } from "../utils";
import { useEntries as useEntriesApi } from "./useNokoApi";

type State = {
  filter: EntryDateEnum;
  entries: EntryType[];
};

const useEntries = () => {
  const { userId } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    filter: EntryDateEnum.Today,
    entries: [],
  });

  const filterByDay = useMemo(
    () => formattedFilterDate(state.filter),
    [state.filter],
  );

  const { data, isLoading, error } = useEntriesApi(
    userId.toString(),
    filterByDay,
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      entries: entryDecorator(data),
    }));
  }, [data]);

  const handleFilterChange = (newFilter: EntryDateEnum) => {
    setState((prevState) => ({
      ...prevState,
      filter: newFilter,
    }));
  };

  return {
    ...state,
    isLoading,
    error,
    setFilter: handleFilterChange,
  };
};

export default useEntries;
