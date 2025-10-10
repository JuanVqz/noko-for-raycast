// Optimized hooks
import {
  useApiData,
  useProjectsWithTimers,
  useTimers,
  useProjects,
  useTags,
  useEntries,
} from "./useApiData";
import { useTimerActions } from "./useTimerActions";
import { useElapsedTime } from "./useElapsedTime";
import { useEntrySubmission } from "./useEntrySubmission";
import useDetailToggle from "./useDetailToggle";

export {
  // Data fetching hooks
  useApiData,
  useProjectsWithTimers,
  useTimers,
  useProjects,
  useTags,
  useEntries,
  // Action hooks
  useTimerActions,
  useElapsedTime,
  useEntrySubmission,
  // UI hooks
  useDetailToggle,
};
