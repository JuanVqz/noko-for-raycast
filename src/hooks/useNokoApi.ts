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

export const startTimer = async (projectId: string) => {
  const response = await fetch(`${NOKO_BASE_URL}/projects/${projectId}/timer/start`, {
    method: "PUT",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to start timer: ${response.statusText}`);
  }

  return response.json();
};

export const pauseTimer = async (pauseUrl: string) => {
  const response = await fetch(pauseUrl, {
    method: "PUT",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to pause timer: ${response.statusText}`);
  }

  // Check if response has content before trying to parse JSON
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    if (text.trim()) {
      return JSON.parse(text);
    }
  }

  // Return empty object for successful pause operations with no content
  return {};
};

export const stopTimer = async (logUrl: string) => {
  const response = await fetch(logUrl, {
    method: "PUT",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to stop timer: ${response.statusText}`);
  }

  // Check if response has content before trying to parse JSON
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    if (text.trim()) {
      return JSON.parse(text);
    }
  }

  // Return empty object for successful stop operations with no content
  return {};
};
