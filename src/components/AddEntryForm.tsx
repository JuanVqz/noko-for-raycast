import { Form, ActionPanel, Action } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useProjects, useTags, useEntrySubmission } from "../hooks";

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
}

export default function AddEntryForm({ onSubmit, onCancel }: AddEntryFormProps) {
  const p = useProjects();
  const t = useTags();
  const { handleSubmit: handleEntrySubmit } = useEntrySubmission();

  const { handleSubmit, itemProps } = useForm<EntryFormValues>({
    initialValues: {
      minutes: "15",
      project_name: "",
      description: "",
      tags: [],
      date: new Date(),
    },
    validation: {
      minutes: (value: string | undefined) => {
        if (!value || value.trim() === "") {
          return "Minutes is required";
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          return "Minutes must be a positive number";
        }
        return undefined;
      },
      project_name: FormValidation.Required,
      description: FormValidation.Required,
      tags: (value: string[] | undefined) => {
        return undefined;
      },
      date: FormValidation.Required,
    },
    onSubmit: async (values) => {
      await handleEntrySubmit(values);
      onSubmit?.();
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
          {onCancel && (
            <Action title="Cancel" onAction={onCancel} />
          )}
        </ActionPanel>
      }
    >
      <Form.Description text="Add a new Noko Time Entry" />

      <Form.TextField
        title="Minutes"
        placeholder="Enter your time in minutes"
        autoFocus
        {...itemProps.minutes}
      />

      <Form.Dropdown title="Project" {...itemProps.project_name}>
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
