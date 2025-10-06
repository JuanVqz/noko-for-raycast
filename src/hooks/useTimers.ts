import { getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useMemo, useCallback } from "react";

import { TimerType, TimerStateEnum, IPreferences } from "../types";

const useTimers = () => {
  const { personalAccessToken } = getPreferenceValues<IPreferences>();
  const [filter, setFilter] = useState<TimerStateEnum>(TimerStateEnum.Running);

  const {
    data: timers = [],
    isLoading,
    error,
  } = useFetch<TimerType[]>(`https://api.nokotime.com/v2/timers`, {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    keepPreviousData: true,
  });

  const filteredTimers = useMemo(() => {
    return timers.filter((timer) => timer.state === filter);
  }, [timers, filter]);

  const handleFilterChange = useCallback((newFilter: TimerStateEnum) => {
    setFilter(newFilter);
  }, []);

  return {
    timers,
    filteredTimers,
    filter,
    isLoading,
    error,
    setFilter: handleFilterChange,
  };
};

export default useTimers;
