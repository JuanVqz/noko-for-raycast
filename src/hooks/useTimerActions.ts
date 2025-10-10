import { showToast, Toast } from "@raycast/api";
import { useCallback } from "react";
import { apiClient } from "../lib/api-client";
import { ProjectType, TimerType, TimerLogData } from "../types";

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
    ) => {
      try {
        const result = await apiCall();

        if (!result.success) {
          const errorMessage = result.error || "Unknown error";
          showToast({
            style: Toast.Style.Failure,
            title: errorTitle,
            message: errorMessage,
          });
          onError?.(errorMessage);
          return;
        }

        showToast({
          style: Toast.Style.Success,
          title: "Success",
          message: successMessage,
        });
        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        showToast({
          style: Toast.Style.Failure,
          title: errorTitle,
          message: errorMessage,
        });
        onError?.(errorMessage);
      }
    },
    [onSuccess, onError],
  );

  const startTimer = useCallback(
    async (project: ProjectType) => {
      await handleApiCall(
        () => apiClient.put(`/projects/${project.id}/timer/start`),
        `Started timer for ${project.name}`,
        "Failed to Start Timer",
      );
    },
    [handleApiCall],
  );

  const pauseTimer = useCallback(
    async (project: ProjectType) => {
      await handleApiCall(
        () => apiClient.put(`/projects/${project.id}/timer/pause`),
        `Paused timer for ${project.name}`,
        "Failed to Pause Timer",
      );
    },
    [handleApiCall],
  );

  const discardTimer = useCallback(
    async (project: ProjectType) => {
      await handleApiCall(
        () => apiClient.delete(`/projects/${project.id}/timer`),
        `Timer discarded for ${project.name} (time not saved)`,
        "Failed to Discard Timer",
      );
    },
    [handleApiCall],
  );

  const logTimer = useCallback(
    async (projectId: string, entryData: TimerLogData) => {
      await handleApiCall(
        () => apiClient.put(`/projects/${projectId}/timer/log`, entryData),
        `Timer logged for project`,
        "Failed to Log Timer",
      );
    },
    [handleApiCall],
  );

  return {
    startTimer,
    pauseTimer,
    discardTimer,
    logTimer,
  };
};
