import { showToast, Toast, popToRoot } from "@raycast/api";
import { useCallback } from "react";
import { createEntry } from "./useNokoApi";
import { dateOnTimezone } from "../utils";

interface EntryFormValues {
  minutes: string;
  project_name: string;
  description: string;
  tags: string[];
  date: Date;
}

export function useEntrySubmission() {
  const handleSubmit = useCallback(async (values: EntryFormValues) => {
    const toast = await showToast({
      title: "Creating entry...",
      style: Toast.Style.Animated,
    });

    try {
      await createEntry({
        minutes: parseInt(values.minutes),
        project_name: values.project_name,
        description: values.description
          .concat(" ", values.tags.join(" "))
          .trim(),
        date: dateOnTimezone(values.date),
      });

      toast.title = "Entry created";
      toast.style = Toast.Style.Success;

      popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to create entry";
    }
  }, []);

  return { handleSubmit };
}
