import { useCallback } from "react";
import { apiClient } from "../lib/api-client";
import { ProjectType, EntryFormData } from "../types";
import {
  showSuccessToast,
  showErrorToast,
  parseTimeInput,
  combineDescriptionAndTags,
  dateOnTimezone,
} from "../utils";
import { TOAST_MESSAGES } from "../constants";

interface UseTimerActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useTimerActions = (options: UseTimerActionsOptions = {}) => {
  const { onSuccess, onError } = options;

  const handleApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<{ success: boolean; error?: string; data?: T }>,
      successMessage: string,
      errorTitle: string,
      successTitle: string,
    ) => {
      try {
        const result = await apiCall();

        if (!result.success) {
          const errorMessage =
            result.error || TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
          showErrorToast(errorTitle, errorMessage);
          onError?.(errorMessage);
          return;
        }

        showSuccessToast(successTitle, successMessage);
        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
        showErrorToast(errorTitle, errorMessage);
        onError?.(errorMessage);
      }
    },
    [onSuccess, onError],
  );

  const apiStartTimer = useCallback(async (project: ProjectType) => {
    return await apiClient.put(`/projects/${project.id}/timer/start`);
  }, []);

  const apiPauseTimer = useCallback(async (project: ProjectType) => {
    return await apiClient.put(`/projects/${project.id}/timer/pause`);
  }, []);

  const apiDiscardTimer = useCallback(async (project: ProjectType) => {
    return await apiClient.delete(`/projects/${project.id}/timer`);
  }, []);

  const startTimer = useCallback(
    async (project: ProjectType) => {
      await handleApiCall(
        () => apiStartTimer(project),
        `Started timer for ${project.name}`,
        TOAST_MESSAGES.ERROR.FAILED_TO_START_TIMER,
        TOAST_MESSAGES.SUCCESS.TIMER_STARTED,
      );
    },
    [handleApiCall, apiStartTimer],
  );

  const pauseTimer = useCallback(
    async (project: ProjectType) => {
      await handleApiCall(
        () => apiPauseTimer(project),
        `Paused timer for ${project.name}`,
        TOAST_MESSAGES.ERROR.FAILED_TO_PAUSE_TIMER,
        TOAST_MESSAGES.SUCCESS.TIMER_PAUSED,
      );
    },
    [handleApiCall, apiPauseTimer],
  );

  const discardTimer = useCallback(
    async (project: ProjectType) => {
      await handleApiCall(
        () => apiDiscardTimer(project),
        `Timer discarded for ${project.name} (time not saved)`,
        TOAST_MESSAGES.ERROR.FAILED_TO_DISCARD_TIMER,
        TOAST_MESSAGES.SUCCESS.TIMER_DISCARDED,
      );
    },
    [handleApiCall, apiDiscardTimer],
  );

  const resetTimer = useCallback(
    async (project: ProjectType) => {
      try {
        const discardResult = await apiDiscardTimer(project);

        if (!discardResult.success) {
          const errorMessage =
            discardResult.error || TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
          showErrorToast(
            TOAST_MESSAGES.ERROR.FAILED_TO_RESET_TIMER,
            errorMessage,
          );
          onError?.(errorMessage);
          return;
        }

        const startResult = await apiStartTimer(project);

        if (!startResult.success) {
          const errorMessage =
            startResult.error || TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
          showErrorToast(
            TOAST_MESSAGES.ERROR.FAILED_TO_RESET_TIMER,
            errorMessage,
          );
          onError?.(errorMessage);
          return;
        }

        showSuccessToast(
          TOAST_MESSAGES.SUCCESS.TIMER_RESET,
          `Timer reset for ${project.name}`,
        );
        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
        showErrorToast(
          TOAST_MESSAGES.ERROR.FAILED_TO_RESET_TIMER,
          errorMessage,
        );
        onError?.(errorMessage);
      }
    },
    [apiDiscardTimer, apiStartTimer, onSuccess, onError],
  );

  const logTimer = useCallback(
    async (projectId: string, entryData: EntryFormData) => {
      const payload = {
        minutes: parseTimeInput(entryData.minutes),
        description: combineDescriptionAndTags(
          entryData.description,
          entryData.tags,
        ),
        entry_date: dateOnTimezone(entryData.date),
      };

      await handleApiCall(
        () => apiClient.put(`/projects/${projectId}/timer/log`, payload),
        `Timer logged for project`,
        TOAST_MESSAGES.ERROR.FAILED_TO_LOG_TIMER,
        TOAST_MESSAGES.SUCCESS.TIMER_LOGGED,
      );
    },
    [handleApiCall],
  );

  return {
    startTimer,
    pauseTimer,
    discardTimer,
    resetTimer,
    logTimer,
  };
};
