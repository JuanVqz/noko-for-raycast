import { Form, ActionPanel, Action } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { ProjectType, TimerType, TimerToLog, EntryFormData } from "../types";
import { useProjects, useTags } from "../hooks/useApiData";
import { useEntrySubmission, useTimerActions } from "../hooks";
import { dateOnTimezone } from "../utils";

interface AddEntryFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  timerToLog?: TimerToLog;
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

  // Helper functions
  const formatMinutesAsTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }, []);

  const getBillingIncrementForProject = useCallback(
    (projectName: string): number => {
      const project = projects.find((p) => p.name === projectName);
      return project?.billing_increment || 15;
    },
    [projects],
  );

  const getInitialMinutes = useCallback((): string => {
    if (timerToLog) {
      // For timer logging, use the project's billing increment as default
      const billingIncrement = timerToLog.project.billing_increment || 15;
      return formatMinutesAsTime(billingIncrement);
    }
    // For manual entries, default to standard billing increment
    return "0:15";
  }, [timerToLog, formatMinutesAsTime]);

  const getInitialProject = useCallback((): string => {
    return timerToLog?.project.name || "";
  }, [timerToLog]);

  const handleProjectChange = useCallback(
    (projectName: string) => {
      if (!timerToLog && projectName) {
        const billingIncrement = getBillingIncrementForProject(projectName);
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
          await logTimer(timerToLog.project.id, {
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
        // Error handling is done in the hooks
        console.error("Form submission error:", error);
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
      title: tag.name,
      value: tag.name,
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
        autoFocus={!timerToLog}
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
        defaultValue={new Date()}
        info="Select the date for this time entry"
      />
    </Form>
  );
};
