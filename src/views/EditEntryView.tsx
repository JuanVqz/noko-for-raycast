import {
  Form,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useMemo, useCallback, useState } from "react";
import { EntryType } from "../types";
import { useProjects, useTags } from "../hooks/useApiData";
import { useEntryActions } from "../hooks";
import {
  combineDescriptionAndTags,
  dateOnTimezone,
  formatMinutesAsTime,
  parseTimeInput,
} from "../utils";
import { FORM_MESSAGES, TOAST_MESSAGES } from "../constants";

interface EditEntryViewProps {
  entry: EntryType;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export const EditEntryView = ({
  entry,
  onSubmit,
  onCancel,
}: EditEntryViewProps) => {
  const { data: projects = [] } = useProjects();
  const { data: tags = [] } = useTags();
  const { editEntry } = useEntryActions({ onSuccess: onSubmit });

  const [minutesValue, setMinutesValue] = useState<string>(
    formatMinutesAsTime(entry.minutes),
  );

  const handleSubmit = useCallback(
    async (values: {
      project_name: string;
      minutes: string;
      description: string;
      tags: string[];
      date: Date;
    }) => {
      try {
        const selectedProject =
          projects.find((p) => p.name === values.project_name) ?? entry.project;

        await editEntry({
          entryId: entry.id,
          minutes: parseTimeInput(values.minutes),
          description: combineDescriptionAndTags(
            values.description,
            values.tags,
          ),
          date: dateOnTimezone(values.date),
          projectId: selectedProject.id,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;

        showToast({
          style: Toast.Style.Failure,
          title: TOAST_MESSAGES.ERROR.INVALID_INPUT,
          message: errorMessage,
        });
      }
    },
    [entry, projects, editEntry],
  );

  const projectOptions = useMemo(
    () => projects.map((p) => ({ title: p.name, value: p.name })),
    [projects],
  );

  const tagOptions = useMemo(
    () =>
      tags.map((t) => ({ title: t.formatted_name, value: t.formatted_name })),
    [tags],
  );

  const existingTagValues = useMemo(
    () => entry.tags.map((t) => t.formatted_name),
    [entry.tags],
  );

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Entry" onSubmit={handleSubmit} />
          {onCancel && (
            <Action
              title="Back"
              icon={Icon.ArrowLeft}
              onAction={onCancel}
              shortcut={{ modifiers: ["cmd"], key: "[" }}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="project_name"
        title="Project"
        defaultValue={entry.project.name}
        info={FORM_MESSAGES.PROJECT.INFO}
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
        placeholder={FORM_MESSAGES.TIME.PLACEHOLDER}
        value={minutesValue}
        onChange={setMinutesValue}
        info={FORM_MESSAGES.TIME.INFO}
      />

      <Form.TextArea
        id="description"
        title="Description"
        defaultValue={entry.description}
        placeholder={FORM_MESSAGES.DESCRIPTION.PLACEHOLDER}
        info={FORM_MESSAGES.DESCRIPTION.INFO_MANUAL}
      />

      <Form.TagPicker
        id="tags"
        title="Tags"
        defaultValue={existingTagValues}
        info={FORM_MESSAGES.TAGS.INFO}
      >
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
        defaultValue={new Date(entry.date)}
        info={FORM_MESSAGES.DATE.INFO}
      />
    </Form>
  );
};
