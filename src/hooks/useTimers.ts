import { useState, useMemo, useCallback } from "react";
import { TimerStateEnum } from "../types";
import { useTimers as useTimersApi } from "./useNokoApi";

const useTimers = () => {
  const [filter, setFilter] = useState<TimerStateEnum>(TimerStateEnum.Running);

  const { data: timers = [], isLoading, error } = useTimersApi();

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
