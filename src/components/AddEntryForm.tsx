import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useMemo, useCallback, useState, useEffect } from "react";
import { ProjectType, EntryFormData } from "../types";
import { useProjects, useTags } from "../hooks/useApiData";
import { useEntrySubmission, useTimerActions } from "../hooks";
import { dateOnTimezone, getElapsedTime } from "../utils";

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

  // State for the minutes field
  const [minutesValue, setMinutesValue] = useState<string>("0:15");

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

  const getInitialProject = useCallback((): string => {
    return timerToLog?.name || "";
  }, [timerToLog]);

  const getInitialDate = useCallback((): Date => {
    // Early return for manual entries (no timer to log)
    if (!timerToLog?.timer.date) {
      return new Date();
    }

    // Parse the timer's date string more carefully to avoid timezone issues
    // Convert YYYY-MM-DD to YYYY/MM/DD to ensure local time interpretation
    const dateString = timerToLog.timer.date;
    const localDateString = dateString.replace(/-/g, "/");

    return new Date(localDateString);
  }, [timerToLog]);

  // Set initial minutes value once when component mounts or timer changes
  useEffect(() => {
    if (timerToLog) {
      // Calculate elapsed time synchronously for initial value
      const currentTime = new Date();
      const fetchTime = new Date(); // Use current time as fetch time for initial calculation
      const initialElapsedTime = getElapsedTime(
        timerToLog.timer,
        currentTime,
        fetchTime,
      );

      const minutes = convertElapsedTimeToMinutes(initialElapsedTime);
      const formattedTime = formatMinutesAsTime(minutes);
      setMinutesValue(formattedTime);
    } else {
      setMinutesValue("0:15");
    }
  }, [timerToLog]); // Only run when timerToLog changes

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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

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
        value={minutesValue}
        onChange={setMinutesValue}
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
