import { useState, useMemo, useCallback } from "react";
import { EntryDateEnum } from "../types";
import { entryDecorator, formattedFilterDate } from "../utils";
import { useEntries as useEntriesApi } from "./useApiData";

const useEntries = () => {
  const [filter, setFilter] = useState<EntryDateEnum>(EntryDateEnum.Today);

  const filterByDay = useMemo(() => formattedFilterDate(filter), [filter]);

  const { data, isLoading, error } = useEntriesApi(filterByDay);

  const filteredEntries = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return entryDecorator(data);
  }, [data]);

  const handleFilterChange = useCallback((newFilter: EntryDateEnum) => {
    setFilter(newFilter);
  }, []);

  return {
    filteredEntries,
    filter,
    isLoading,
    error,
    setFilter: handleFilterChange,
  };
};

export default useEntries;
