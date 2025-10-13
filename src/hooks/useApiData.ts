import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { apiClient } from "../lib/api-client";
import {
  TimerType,
  TimerApiResponse,
  EntryType,
  ProjectType,
  TagType,
} from "../types";
import { createTimerNull } from "../utils";

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
  } = useApiData<TimerApiResponse[]>("/timers");

  const timers = useMemo(() => {
    return (apiTimers || []) as TimerType[];
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
      map.set(apiTimer.project.id, apiTimer as TimerType);
    });
    return map;
  }, [apiTimers]);
};

// Hook to fetch individual timer data by project ID
export const useTimer = (projectId: string | null) => {
  const {
    data: apiTimer,
    isLoading,
    mutate,
    ...rest
  } = useApiData<TimerApiResponse>(`/projects/${projectId}/timer`, {
    enabled: !!projectId,
  });

  const timer = useMemo(() => {
    return (apiTimer as TimerType) || createTimerNull();
  }, [apiTimer]);

  return {
    data: timer,
    isLoading,
    mutate,
    ...rest,
  };
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
      timer: timerMap.get(project.id) || createTimerNull(),
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
