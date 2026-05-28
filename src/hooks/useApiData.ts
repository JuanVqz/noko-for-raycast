import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { dateOnTimezone } from "../utils";
import { apiClient } from "../lib/api-client";
import { getTimerStatePriority } from "../utils/timer-utils";
import { TimerType, EntryType, ProjectType, TagType } from "../types";

const NOKO_BASE_URL = "https://api.nokotime.com/v2";

// Generic hook for API data fetching with better error handling
export function useApiData<T>(
  endpoint: string,
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  },
) {
  const { enabled = true, keepPreviousData = true } = options || {};

  // Convert relative endpoint to absolute URL
  const absoluteUrl = endpoint.startsWith("http")
    ? endpoint
    : `${NOKO_BASE_URL}${endpoint}`;

  return useFetch<T>(absoluteUrl, {
    headers: apiClient.headers,
    keepPreviousData,
    execute: enabled,
  });
}

// Optimized hooks for specific data types
export const useTimers = () => {
  const {
    data: apiTimers,
    isLoading,
    mutate,
    ...rest
  } = useApiData<TimerType[]>("/timers");

  const timers = useMemo(() => {
    if (!apiTimers) return [];

    return [...apiTimers].sort((a, b) => {
      const priorityA = getTimerStatePriority(a.state);
      const priorityB = getTimerStatePriority(b.state);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return a.project.name.localeCompare(b.project.name);
    });
  }, [apiTimers]);

  return {
    data: timers,
    isLoading,
    mutate,
    ...rest,
  };
};

export const useProjects = (
  filter: "active" | "archived" | "all" = "active",
) => {
  const params =
    filter === "active"
      ? "enabled=true&per_page=100"
      : filter === "archived"
        ? "enabled=false&per_page=100"
        : "per_page=100";
  return useApiData<ProjectType[]>(`/projects?${params}`);
};

export const useTags = () => {
  return useApiData<TagType[]>("/tags");
};

export const useEntries = (dateFilter: string) => {
  const endpoint = `/current_user/entries?from=${dateFilter}&to=${dateFilter}`;
  return useApiData<EntryType[]>(endpoint, {
    enabled: !!dateFilter,
  });
};

// Hook to fetch individual timer data by project ID (for specific use cases)
export const useTimer = (projectId: string | null) => {
  return useApiData<TimerType>(`/projects/${projectId}/timer`, {
    enabled: !!projectId,
  });
};

export const useRecentEntries = (days = 30) => {
  const fromDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return dateOnTimezone(d);
  }, [days]);

  const today = useMemo(() => dateOnTimezone(new Date()), []);

  const endpoint = `/current_user/entries?from=${fromDate}&to=${today}&per_page=100`;
  return useApiData<EntryType[]>(endpoint);
};

export const useWeekEntries = () => {
  const sunday = useMemo(() => {
    const today = new Date();
    const sundayDate = new Date(today);
    sundayDate.setDate(today.getDate() - today.getDay());
    return dateOnTimezone(sundayDate);
  }, []);

  const today = useMemo(() => dateOnTimezone(new Date()), []);

  const endpoint = `/current_user/entries?from=${sunday}&to=${today}`;
  return useApiData<EntryType[]>(endpoint);
};
