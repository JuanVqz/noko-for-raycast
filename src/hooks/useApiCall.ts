import { useCallback } from "react";
import { showSuccessToast, showErrorToast } from "../utils";
import { TOAST_MESSAGES } from "../constants";

interface UseApiCallOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useApiCall = (options: UseApiCallOptions = {}) => {
  const { onSuccess, onError } = options;

  return useCallback(
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
};
