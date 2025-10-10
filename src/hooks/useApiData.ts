import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { apiClient } from "../lib/api-client";
import { TimerType, TimerApiResponse, TimerNullType, EntryType, ProjectType, TagType, TimerStateEnum } from "../types";

const NOKO_BASE_URL = "https://api.nokotime.com/v2";

// Helper function to transform API response to clean timer type
const transformTimerApiResponse = (apiTimer: TimerApiResponse): TimerType => ({
  id: apiTimer.id,
  state: apiTimer.state,
  date: apiTimer.date,
  seconds: apiTimer.seconds,
  url: apiTimer.url,
  start_url: apiTimer.start_url,
  pause_url: apiTimer.pause_url,
  add_or_subtract_time_url: apiTimer.add_or_subtract_time_url,
  log_url: apiTimer.log_url,
  log_inbox_entry_url: apiTimer.log_inbox_entry_url,
});

// Helper function to create a TimerNullType object
const createTimerNull = (project: ProjectType): TimerNullType => ({
  id: "",
  state: TimerStateEnum.Paused,
  date: "",
  seconds: 0,
  url: "",
  start_url: "",
  pause_url: "",
  add_or_subtract_time_url: "",
  log_url: "",
  log_inbox_entry_url: "",
});

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
  const { data: apiTimers, isLoading, mutate, ...rest } = useApiData<TimerApiResponse[]>("/timers");

  const timers = useMemo(() => {
    return apiTimers?.map(transformTimerApiResponse) || [];
  }, [apiTimers]);

  return {
    data: timers,
    isLoading,
    mutate,
    ...rest,
  };
};

export const useProjects = () => {
  return useApiData<ProjectType[]>("/projects?enabled=true");
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

// Memoized timer map for efficient lookups
export const useTimerMap = (apiTimers: TimerApiResponse[] = []) => {
  return useMemo(() => {
    const map = new Map<string, TimerType>();
    apiTimers.forEach((apiTimer) => {
      const timer = transformTimerApiResponse(apiTimer);
      map.set(apiTimer.project.id, timer);
    });
    return map;
  }, [apiTimers]);
};

// Combined projects with timer data
export const useProjectsWithTimers = () => {
  const {
    data: projects = [],
    isLoading: projectsLoading,
    mutate: mutateProjects,
  } = useProjects();
  const {
    data: apiTimers = [],
    isLoading: timersLoading,
    mutate: mutateTimers,
  } = useApiData<TimerApiResponse[]>("/timers");

  const timerMap = useTimerMap(apiTimers);

  const projectsWithTimers = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      timer: timerMap.get(project.id) || createTimerNull(project),
    }));
  }, [projects, timerMap]);

  const isLoading = projectsLoading || timersLoading;

  const refresh = () => {
    mutateProjects();
    mutateTimers();
  };

  const refreshTimersOnly = () => {
    mutateTimers();
  };

  return {
    data: projectsWithTimers,
    isLoading,
    refresh,
    refreshTimersOnly,
    mutateProjects,
    mutateTimers,
  };
};
