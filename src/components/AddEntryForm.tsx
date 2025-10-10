import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useProjects, useTags, useEntrySubmission } from "../hooks";
import { logTimer } from "../hooks/useNokoApi";
import { ProjectType, TimerType } from "../types";
import { dateOnTimezone } from "../utils";

interface EntryFormValues {
  minutes: string;
  project_name: string;
  description: string;
  tags: string[];
  date: Date;
}

interface AddEntryFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  timerToLog?: { project: ProjectType; timer: TimerType };
}

export default function AddEntryForm({
  onSubmit,
  onCancel,
  timerToLog,
}: AddEntryFormProps) {
  const p = useProjects();
  const t = useTags();
  const { handleSubmit: handleEntrySubmit } = useEntrySubmission();

  // Calculate initial minutes based on context
  const getInitialMinutes = () => {
    if (timerToLog) {
      // For timer logging, use the project's billing increment as default
      // User can still edit to use exact elapsed time if they want
      const billingIncrement = timerToLog.project.billing_increment || 15;
      return formatMinutesAsTime(billingIncrement);
    }
    // For manual entries, default to Noko's standard billing increment
    // The project change handler will update this when a project is selected
    return "0:15";
  };

  // Helper function to get billing increment for a project
  const getBillingIncrementForProject = (projectName: string) => {
    const project = (p.data || []).find((p) => p.name === projectName);
    return project?.billing_increment || 15;
  };

  // Helper function to format minutes as h:mm
  const formatMinutesAsTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  };

  // Handler for when project changes - update time field to project's billing increment
  const handleProjectChange = (projectName: string) => {
    // Only update if this is not from a timer (timer should keep its elapsed time)
    if (!timerToLog) {
      const billingIncrement = getBillingIncrementForProject(projectName);
      setValue("minutes", formatMinutesAsTime(billingIncrement));
    }
    setValue("project_name", projectName);
  };

  // Helper function to convert h:mm format to total minutes
  const parseTimeToMinutes = (timeString: string): number => {
    // Check if it's in h:mm format
    const timeMatch = timeString.match(/^(\d+):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      if (minutes >= 60) {
        throw new Error("Minutes must be less than 60");
      }
      return hours * 60 + minutes;
    }

    // Fallback to integer minutes for backward compatibility
    const numValue = parseFloat(timeString);
    if (isNaN(numValue)) {
      throw new Error(
        "Invalid time format. Use h:mm (e.g., 1:30) or minutes (e.g., 90)",
      );
    }
    return numValue;
  };

  const { handleSubmit, itemProps, setValue } = useForm<EntryFormValues>({
    initialValues: {
      minutes: getInitialMinutes(),
      project_name: timerToLog?.project.name || "",
      description: "",
      tags: [],
      date: new Date(),
    },
    validation: {
      minutes: (value: string | undefined) => {
        if (!value || value.trim() === "") {
          return "Time is required";
        }
        try {
          const minutes = parseTimeToMinutes(value);
          if (minutes <= 0) {
            return "Time must be greater than 0";
          }
          return undefined;
        } catch (error) {
          return error instanceof Error ? error.message : "Invalid time format";
        }
      },
      project_name: FormValidation.Required,
      description: FormValidation.Required,
      tags: (value: string[] | undefined) => {
        return undefined;
      },
      date: FormValidation.Required,
    },
    onSubmit: async (values) => {
      // Convert time format to minutes for the API
      const minutes = parseTimeToMinutes(values.minutes);

      // If this is from a timer, use the logTimer API directly
      if (timerToLog) {
        try {
          await logTimer(timerToLog.project.id, {
            minutes: minutes,
            description: values.description
              .concat(" ", values.tags.join(" "))
              .trim(),
            entry_date: dateOnTimezone(values.date),
          });

          showToast({
            style: Toast.Style.Success,
            title: "Timer Logged",
            message: `Timer logged for ${timerToLog.project.name}`,
          });

          onSubmit?.();
          return;
        } catch (error) {
          showToast({
            style: Toast.Style.Failure,
            title: "Failed to Log Timer",
            message: error instanceof Error ? error.message : "Unknown error",
          });
          return;
        }
      }

      // For regular entries (not from timer), use the existing flow
      const entryValues = {
        ...values,
        minutes: minutes.toString(),
      };

      await handleEntrySubmit(entryValues);
      onSubmit?.();
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
          {onCancel && <Action title="Cancel" onAction={onCancel} />}
        </ActionPanel>
      }
    >
      <Form.Description text="Add a new Noko Time Entry" />

      <Form.TextField
        title="Time"
        placeholder="Enter time (e.g., 1:30 for 1 hour 30 minutes)"
        autoFocus
        {...itemProps.minutes}
      />

      <Form.Dropdown
        title="Project"
        {...itemProps.project_name}
        onChange={handleProjectChange}
      >
        {(p.data || []).map((project) => (
          <Form.Dropdown.Item
            key={project.id}
            value={project.name}
            title={project.name}
          />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        title="Description"
        placeholder="Enter entry's description"
        {...itemProps.description}
      />

      <Form.TagPicker title="Tags" {...itemProps.tags}>
        {(t.data || []).map((tag) => (
          <Form.TagPicker.Item
            key={tag.id}
            value={tag.formatted_name}
            title={tag.formatted_name}
          />
        ))}
      </Form.TagPicker>

      <Form.DatePicker
        title="Date"
        id="date"
        value={itemProps.date?.value}
        error={itemProps.date?.error}
        onChange={(newValue) => {
          if (itemProps.date?.onChange && newValue) {
            itemProps.date.onChange(newValue);
          }
        }}
      />
    </Form>
  );
}
