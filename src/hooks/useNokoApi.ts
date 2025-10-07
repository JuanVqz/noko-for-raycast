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

const useNokoApi = () => {
  const { personalAccessToken } = getPreferenceValues<IPreferences>();

  const getHeaders = () => ({
    "X-NokoToken": personalAccessToken,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  return {
    getHeaders,
    baseUrl: NOKO_BASE_URL,
  };
};

export const useTimers = () => {
  const { getHeaders } = useNokoApi();

  return useFetch<TimerType[]>(`${NOKO_BASE_URL}/timers`, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const useEntries = (userId: string, dateFilter: string) => {
  const { getHeaders } = useNokoApi();

  const url = `${NOKO_BASE_URL}/entries?user_ids=${userId}&from=${dateFilter}&to=${dateFilter}`;

  return useFetch<EntryType[]>(url, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const useProjects = () => {
  const { getHeaders } = useNokoApi();

  return useFetch<ProjectType[]>(`${NOKO_BASE_URL}/projects?enabled=true`, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export const useTags = () => {
  const { getHeaders } = useNokoApi();

  return useFetch<TagType[]>(`${NOKO_BASE_URL}/tags`, {
    headers: getHeaders(),
    keepPreviousData: true,
  });
};

export default useNokoApi;
