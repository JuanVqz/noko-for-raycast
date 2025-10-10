import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { apiClient } from "../lib/api-client";
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
  return useApiData<TimerType[]>("/timers");
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
export const useTimerMap = (timers: TimerType[] = []) => {
  return useMemo(() => {
    const map = new Map<string, TimerType>();
    timers.forEach((timer) => {
      map.set(timer.project.id, timer);
    });
    return map;
  }, [timers]);
};

// Combined projects with timer data
export const useProjectsWithTimers = () => {
  const {
    data: projects = [],
    isLoading: projectsLoading,
    mutate: mutateProjects,
  } = useProjects();
  const {
    data: timers = [],
    isLoading: timersLoading,
    mutate: mutateTimers,
  } = useTimers();

  const timerMap = useTimerMap(timers);

  const projectsWithTimers = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      timer: timerMap.get(project.id),
    }));
  }, [projects, timerMap]);

  const isLoading = projectsLoading || timersLoading;

  const refresh = () => {
    mutateProjects();
    mutateTimers();
  };

  return {
    data: projectsWithTimers,
    isLoading,
    refresh,
    mutateProjects,
    mutateTimers,
  };
};
