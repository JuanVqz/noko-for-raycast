import { useState, useMemo, useCallback } from "react";

import { EntryDateEnum } from "../types";
import { entryDecorator, formattedFilterDate } from "../utils";
import { useEntries as useEntriesApi } from "./useNokoApi";

const useEntries = () => {
  const [filter, setFilter] = useState<EntryDateEnum>(EntryDateEnum.Today);

  const filterByDay = useMemo(() => formattedFilterDate(filter), [filter]);

  const { data, isLoading, error } = useEntriesApi(filterByDay);

  const filteredEntries = useMemo(() => {
    return data ? entryDecorator(data) : [];
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
