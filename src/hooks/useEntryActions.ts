import { useCallback } from "react";
import { apiClient } from "../lib/api-client";
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
      await handleApiCall(
        () => apiClient.delete(`/entries/${entryId}`),
        TOAST_MESSAGES.SUCCESS.ENTRY_DELETED_DESCRIPTION,
        TOAST_MESSAGES.ERROR.FAILED_TO_DELETE_ENTRY,
        TOAST_MESSAGES.SUCCESS.ENTRY_DELETED,
      );
    },
    [handleApiCall],
  );

  return {
    deleteEntry,
  };
};
