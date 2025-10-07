import { getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import {
  IPreferences,
  TimerType,
  EntryType,
  ProjectType,
  TagType,
} from "../types";

const NOKO_BASE_URL = "https://api.nokotime.com/v2";

const getHeaders = () => {
  const { personalAccessToken } = getPreferenceValues<IPreferences>();

  return {
    "X-NokoToken": personalAccessToken,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

export const useTimers = () => {
  return useFetch<TimerType[]>(`${NOKO_BASE_URL}/timers`, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const useEntries = (dateFilter: string) => {
  const url = `${NOKO_BASE_URL}/current_user/entries?from=${dateFilter}&to=${dateFilter}`;

  return useFetch<EntryType[]>(url, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const useProjects = () => {
  return useFetch<ProjectType[]>(`${NOKO_BASE_URL}/projects?enabled=true`, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const useTags = () => {
  return useFetch<TagType[]>(`${NOKO_BASE_URL}/tags`, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const createEntry = async (entryData: {
  minutes: number;
  project_name: string;
  description: string;
  date: string;
}) => {
  const response = await fetch(`${NOKO_BASE_URL}/entries`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(entryData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create entry: ${response.statusText}`);
  }

  return response.json();
};
