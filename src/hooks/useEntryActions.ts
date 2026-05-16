import { useCallback } from "react";
import { apiClient } from "../lib/api-client";
import { EditEntryPayload } from "../types";
import { TOAST_MESSAGES } from "../constants";
import { useApiCall } from "./useApiCall";

interface UseEntryActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useEntryActions = (options: UseEntryActionsOptions = {}) => {
  const handleApiCall = useApiCall(options);

  const deleteEntry = useCallback(
    async (entryId: string) => {
      await handleApiCall(() => apiClient.delete(`/entries/${entryId}`), {
        errorTitle: TOAST_MESSAGES.ERROR.FAILED_TO_DELETE_ENTRY,
        successTitle: TOAST_MESSAGES.SUCCESS.ENTRY_DELETED,
        successMessage: TOAST_MESSAGES.SUCCESS.ENTRY_DELETED_DESCRIPTION,
      });
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
        {
          errorTitle: TOAST_MESSAGES.ERROR.FAILED_TO_UPDATE_ENTRY,
          successTitle: TOAST_MESSAGES.SUCCESS.ENTRY_UPDATED,
          successMessage: TOAST_MESSAGES.SUCCESS.ENTRY_UPDATED_DESCRIPTION,
        },
      );
    },
    [handleApiCall],
  );

  return {
    deleteEntry,
    editEntry,
  };
};
