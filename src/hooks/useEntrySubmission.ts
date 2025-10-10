import { showToast, Toast } from "@raycast/api";
import { useCallback } from "react";
import { apiClient } from "../lib/api-client";
import { EntryFormData } from "../types";
import { dateOnTimezone } from "../utils";

interface UseEntrySubmissionOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useEntrySubmission = (options: UseEntrySubmissionOptions = {}) => {
  const { onSuccess, onError } = options;

  const parseTimeToMinutes = useCallback((timeString: string): number => {
    const trimmed = timeString.trim();

    // Handle h:mm format (e.g., "1:30", "0:45")
    if (trimmed.includes(":")) {
      const parts = trimmed.split(":");
      if (parts.length === 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        if (isNaN(hours) || isNaN(minutes) || minutes >= 60) {
          throw new Error("Invalid time format. Use h:mm (e.g., 1:30)");
        }

        return hours * 60 + minutes;
      }
    }

    // Handle numeric format (e.g., "90" for 90 minutes)
    const numValue = parseFloat(trimmed);
    if (isNaN(numValue)) {
      throw new Error(
        "Invalid time format. Use h:mm (e.g., 1:30) or minutes (e.g., 90)",
      );
    }

    return numValue;
  }, []);

  const submitEntry = useCallback(
    async (entryData: EntryFormData) => {
      try {
        const minutes = parseTimeToMinutes(entryData.minutes);

        const payload = {
          minutes,
          project_name: entryData.project_name,
          description: entryData.description
            .concat(" ", entryData.tags.join(" "))
            .trim(),
          date: dateOnTimezone(entryData.date),
        };

        const response = await apiClient.post("/entries", payload);

        if (!response.success) {
          throw new Error(response.error || "Failed to create entry");
        }

        showToast({
          style: Toast.Style.Success,
          title: "Entry Added",
          message: "Time entry has been added successfully",
        });

        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        showToast({
          style: Toast.Style.Failure,
          title: "Failed to Add Entry",
          message: errorMessage,
        });

        onError?.(errorMessage);
      }
    },
    [parseTimeToMinutes, onSuccess, onError],
  );

  return {
    submitEntry,
    parseTimeToMinutes,
  };
};
