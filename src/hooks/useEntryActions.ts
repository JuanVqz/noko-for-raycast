import { useCallback } from "react";
import { apiClient } from "../lib/api-client";
import { TOAST_MESSAGES } from "../constants";
import { useApiCall } from "./useApiCall";

interface UseEntryActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface EditEntryPayload {
  entryId: string;
  minutes: number;
  description: string;
  date: string;
  projectId: string;
}

export const useEntryActions = (options: UseEntryActionsOptions = {}) => {
  const handleApiCall = useApiCall(options);

  const deleteEntry = useCallback(
    async (entryId: string) => {
      await handleApiCall(
        () => apiClient.delete(`/entries/${entryId}`),
        TOAST_MESSAGES.SUCCESS.ENTRY_DELETED_DESCRIPTION,
        TOAST_MESSAGES.ERROR.FAILED_TO_DELETE_ENTRY,
        TOAST_MESSAGES.SUCCESS.ENTRY_DELETED,
      );
    },
    [handleApiCall],
  );

  const editEntry = useCallback(
    async ({
      entryId,
      minutes,
      description,
      date,
      projectId,
    }: EditEntryPayload) => {
      await handleApiCall(
        () =>
          apiClient.put(`/entries/${entryId}`, {
            minutes,
            description,
            date,
            project_id: projectId,
          }),
        TOAST_MESSAGES.SUCCESS.ENTRY_UPDATED_DESCRIPTION,
        TOAST_MESSAGES.ERROR.FAILED_TO_UPDATE_ENTRY,
        TOAST_MESSAGES.SUCCESS.ENTRY_UPDATED,
      );
    },
    [handleApiCall],
  );

  return {
    deleteEntry,
    editEntry,
  };
};
