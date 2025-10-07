import { useState, useMemo, useCallback } from "react";
import { TimerStateEnum } from "../types";
import { useTimers as useTimersApi } from "./useNokoApi";

const useTimers = () => {
  const [filter, setFilter] = useState<TimerStateEnum>(TimerStateEnum.Running);

  const { data = [], isLoading, error } = useTimersApi();

  const filteredTimers = useMemo(() => {
    return data.filter((timer) => timer.state === filter);
  }, [data, filter]);

  const handleFilterChange = useCallback((newFilter: TimerStateEnum) => {
    setFilter(newFilter);
  }, []);

  return {
    filteredTimers,
    filter,
    isLoading,
    error,
    setFilter: handleFilterChange,
  };
};

export default useTimers;
