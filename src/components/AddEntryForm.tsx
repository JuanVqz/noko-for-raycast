import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { ProjectType, EntryFormData } from "../types";
import { useProjects, useTags } from "../hooks/useApiData";
import { useEntrySubmission, useTimerActions, useElapsedTime } from "../hooks";
import { dateOnTimezone } from "../utils";

interface AddEntryFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  timerToLog?: ProjectType;
}

export const AddEntryForm = ({
  onSubmit,
  onCancel,
  timerToLog,
}: AddEntryFormProps) => {
  const { data: projects = [] } = useProjects();
  const { data: tags = [] } = useTags();
  const { submitEntry, parseTimeToMinutes } = useEntrySubmission({
    onSuccess: onSubmit,
  });
  const { logTimer } = useTimerActions({
    onSuccess: onSubmit,
  });

  // Get elapsed time for the timer if we're logging a timer
  const elapsedTime = timerToLog ? useElapsedTime(timerToLog.timer) : "0:00";

  // Helper functions
  const formatMinutesAsTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }, []);

  const convertElapsedTimeToMinutes = useCallback(
    (elapsedTimeString: string): number => {
      // Parse elapsed time string like "1:23:45" or "23:45" to minutes
      const parts = elapsedTimeString.split(":").map(Number);
      if (parts.length === 3) {
        // HH:MM:SS format (when hours > 0)
        const [hours, minutes, seconds] = parts;
        return hours * 60 + minutes + Math.round(seconds / 60);
      } else if (parts.length === 2) {
        // MM:SS format (when hours = 0)
        const [minutes, seconds] = parts;
        return minutes + Math.round(seconds / 60);
      }
      return 0;
    },
    [],
  );

  const getBillingIncrementForProject = useCallback(
    (projectName: string): number => {
      const project = projects.find((p) => p.name === projectName);
      return project?.billing_increment || 15;
    },
    [projects],
  );

  const getInitialMinutes = useCallback((): string => {
    if (timerToLog) {
      // For timer logging, use the actual elapsed time
      if (elapsedTime) {
        const minutes = convertElapsedTimeToMinutes(elapsedTime);
        return formatMinutesAsTime(minutes);
      } else if (timerToLog.timer) {
        // Fallback to timer's seconds if elapsedTime is not available
        const minutes = Math.round(timerToLog.timer.seconds / 60);
        return formatMinutesAsTime(minutes);
      }
      // Final fallback to billing increment
      const billingIncrement = timerToLog.billing_increment || 15;
      return formatMinutesAsTime(billingIncrement);
    }
    // For manual entries, default to standard billing increment
    return "0:15";
  }, [
    timerToLog,
    elapsedTime,
    formatMinutesAsTime,
    convertElapsedTimeToMinutes,
  ]);

  const getInitialProject = useCallback((): string => {
    return timerToLog?.name || "";
  }, [timerToLog]);

  const getInitialDate = useCallback((): Date => {
    if (timerToLog?.timer.date) {
      // Use the timer's date if available
      return new Date(timerToLog.timer.date);
    }
    // Default to today for manual entries
    return new Date();
  }, [timerToLog]);

  const handleProjectChange = useCallback(
    (projectName: string) => {
      if (!timerToLog && projectName) {
        getBillingIncrementForProject(projectName);
        // This would need to be handled by the form state management
        // For now, we'll rely on the user to manually adjust if needed
      }
    },
    [timerToLog, getBillingIncrementForProject],
  );

  const handleSubmit = useCallback(
    async (values: EntryFormData) => {
      try {
        const minutes = parseTimeToMinutes(values.minutes);

        if (timerToLog) {
          // Log timer directly
          await logTimer(timerToLog.id, {
            minutes: minutes,
            description: values.description
              .concat(" ", values.tags.join(" "))
              .trim(),
            entry_date: dateOnTimezone(values.date),
          });
        } else {
          // Submit as manual entry
          await submitEntry({
            minutes: values.minutes,
            project_name: values.project_name,
            description: values.description,
            tags: values.tags,
            date: values.date,
          });
        }
      } catch (error) {
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        showToast({
          style: Toast.Style.Failure,
          title: "Invalid Input",
          message: errorMessage,
        });
      }
    },
    [timerToLog, parseTimeToMinutes, logTimer, submitEntry],
  );

  const projectOptions = useMemo(() => {
    return projects.map((project) => ({
      title: project.name,
      value: project.name,
    }));
  }, [projects]);

  const tagOptions = useMemo(() => {
    return tags.map((tag) => ({
      title: tag.formatted_name,
      value: tag.formatted_name,
    }));
  }, [tags]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
          {onCancel && <Action title="Cancel" onAction={onCancel} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="project_name"
        title="Project"
        defaultValue={getInitialProject()}
        onChange={handleProjectChange}
        storeValue={!timerToLog}
        autoFocus={!timerToLog}
      >
        {projectOptions.map((option) => (
          <Form.Dropdown.Item
            key={option.value}
            title={option.title}
            value={option.value}
          />
        ))}
      </Form.Dropdown>

      <Form.TextField
        id="minutes"
        title="Time"
        placeholder="0:15 or 15"
        defaultValue={getInitialMinutes()}
        info="Enter time in h:mm format (e.g., 1:30) or minutes (e.g., 90)"
      />

      <Form.TextArea
        id="description"
        title="Description"
        placeholder="What did you work on?"
        autoFocus={!!timerToLog}
        info={
          timerToLog
            ? "Describe what you worked on during this timer session"
            : "Describe the work you completed"
        }
      />

      <Form.TagPicker id="tags" title="Tags" defaultValue={[]}>
        {tagOptions.map((tag) => (
          <Form.TagPicker.Item
            key={tag.value}
            title={tag.title}
            value={tag.value}
          />
        ))}
      </Form.TagPicker>

      <Form.DatePicker
        id="date"
        title="Date"
        defaultValue={getInitialDate()}
        info="Select the date for this time entry"
      />
    </Form>
  );
};
