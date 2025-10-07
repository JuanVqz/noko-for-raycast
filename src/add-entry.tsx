import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  getPreferenceValues,
  popToRoot,
} from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useProjects, useTags, createEntry } from "./hooks";
import { dateFormat } from "./utils";

interface Preferences {
  personalAccessToken: string;
  timezone?: string;
}

interface EntryFormValues {
  minutes: number;
  project_name: string;
  description: string;
  tags: string[];
  date: Date;
}

type Project = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
  formatted_name: string;
};

export default function Command() {
  const { timezone } = getPreferenceValues<Preferences>();
  const p = useProjects();
  const t = useTags();

  const { handleSubmit } = useForm<EntryFormValues>({
    validation: {
      minutes: (value: number | undefined) => {
        if (!value || value < 0 || isNaN(value)) {
          return "Minutes must be a positive number";
        }
      },
      project_name: FormValidation.Required,
      description: FormValidation.Required,
      date: FormValidation.Required,
    },
    async onSubmit(values) {
      const toast = await showToast({
        title: "Creating entry...",
        style: Toast.Style.Animated,
      });

      try {
        await createEntry({
          minutes: parseInt(values.minutes.toString()),
          project_name: values.project_name,
          description: values.description
            .concat(" ", values.tags.join(" "))
            .trim(),
          date: dateFormat(values.date, timezone),
        });

        toast.title = "Entry created";
        toast.style = Toast.Style.Success;

        popToRoot();
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed to create entry";
      }
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Add a new Noko Time Entry" />

      <Form.TextField
        id="minutes"
        title="Minutes"
        defaultValue="15"
        placeholder="Enter your time in minutes"
        autoFocus
      />

      <Form.Dropdown isLoading={p.isLoading} id="project_name" title="Project">
        {(p.data || []).map(({ id, name }: Project) => (
          <Form.Dropdown.Item key={id} value={name} title={name} />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Enter entry's description"
      />

      <Form.TagPicker id="tags" title="Tags">
        {(t.data || []).map(({ id, formatted_name }: Tag) => (
          <Form.TagPicker.Item
            key={id}
            value={formatted_name}
            title={formatted_name}
          />
        ))}
      </Form.TagPicker>

      <Form.DatePicker id="date" title="Date" defaultValue={new Date()} />
    </Form>
  );
}
