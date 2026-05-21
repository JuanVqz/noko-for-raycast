import { Form, ActionPanel, Action, Icon } from "@raycast/api";
import { useMemo, useCallback, useState, useEffect } from "react";
import { EntryFormData, EntryType, EntryDraft } from "../types";
import { useProjects, useTags, useTimer } from "../hooks/useApiData";
import { useEntrySubmission, useTimerActions } from "../hooks";
import { apiClient } from "../lib/api-client";
import {
  formatMinutesAsTime,
  convertElapsedTimeToMinutes,
  getElapsedTime,
  showSuccessToast,
  showErrorToast,
  stripTagsFromDescription,
} from "../utils";
import { TOAST_MESSAGES, TIME_DEFAULTS, FORM_MESSAGES } from "../constants";

type AddEntryViewProps = {
  draft: EntryDraft;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export const AddEntryView = ({
  draft,
  onSubmit,
  onCancel,
}: AddEntryViewProps) => {
  const isTimerMode = draft.mode === "log-timer";
  // Duplicating reuses the source entry (project + prefilled fields); manual
  // and log-timer carry their own preselected project on the draft.
  const prefillEntry: EntryType | undefined =
    draft.mode === "duplicate" ? draft.entry : undefined;
  const project =
    draft.mode === "duplicate" ? draft.entry.project : draft.project;

  const { data: projects = [] } = useProjects();
  const { data: tags = [] } = useTags();
  // Only fetch the running timer when we are actually in log-timer mode;
  // a 404 here would otherwise surface as "Error: Not Found" for manual entries.
  const { data: timer, isLoading: timerLoading } = useTimer(
    isTimerMode ? project.id : null,
  );
  const { submitEntry } = useEntrySubmission({ onSuccess: onSubmit });
  const { logTimer } = useTimerActions();

  // Duplicated entries reuse the source entry's time. Manual entries default
  // to the project's billing increment from the API (e.g. 5 or 15 min).
  // Log-timer entries are overwritten by elapsed time in the effect below
  // once the timer fetch resolves.
  const [minutesValue, setMinutesValue] = useState<string>(() =>
    prefillEntry
      ? formatMinutesAsTime(prefillEntry.minutes)
      : project.billing_increment && project.billing_increment > 0
        ? formatMinutesAsTime(project.billing_increment)
        : TIME_DEFAULTS.DEFAULT_TIME_FORMAT,
  );

  useEffect(() => {
    if (!isTimerMode || !timer || timerLoading) return;
    const now = new Date();
    const elapsed = getElapsedTime(timer, now, now);
    setMinutesValue(formatMinutesAsTime(convertElapsedTimeToMinutes(elapsed)));
  }, [isTimerMode, timer, timerLoading]);

  const submitTimerLog = useCallback(
    async (values: EntryFormData) => {
      const selectedProject = projects.find(
        (p) => p.name === values.project_name,
      );
      const projectChanged =
        selectedProject && selectedProject.id !== project.id;

      // If the user switched the project on the form, discard the original
      // timer first and then log the time against the chosen project as a
      // regular entry.
      if (projectChanged) {
        const discarded = await apiClient.delete(
          `/projects/${project.id}/timer`,
        );
        if (!discarded.success) {
          showErrorToast(
            TOAST_MESSAGES.ERROR.FAILED_TO_LOG_TIMER,
            discarded.error || TOAST_MESSAGES.ERROR.UNKNOWN_ERROR,
          );
          return;
        }
        await submitEntry(values);
        return;
      }

      const ok = await logTimer(project.id, values);
      if (!ok) return;
      showSuccessToast(
        TOAST_MESSAGES.SUCCESS.TIMER_LOGGED,
        `Timer logged for ${project.name}`,
      );
      onSubmit?.();
    },
    [project, projects, logTimer, submitEntry, onSubmit],
  );

  const handleSubmit = useCallback(
    async (values: EntryFormData) => {
      try {
        if (isTimerMode) {
          await submitTimerLog(values);
        } else {
          await submitEntry(values);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
        showErrorToast(TOAST_MESSAGES.ERROR.INVALID_INPUT, message);
      }
    },
    [isTimerMode, submitTimerLog, submitEntry],
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

  return (
    <Form
      key={prefillEntry?.id}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
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
        defaultValue={project.name}
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
        defaultValue={
          prefillEntry
            ? stripTagsFromDescription(prefillEntry.description)
            : undefined
        }
        placeholder={FORM_MESSAGES.DESCRIPTION.PLACEHOLDER}
        autoFocus
        info={
          isTimerMode
            ? FORM_MESSAGES.DESCRIPTION.INFO_TIMER
            : FORM_MESSAGES.DESCRIPTION.INFO_MANUAL
        }
      />

      <Form.TagPicker
        id="tags"
        title="Tags"
        defaultValue={
          prefillEntry ? prefillEntry.tags.map((t) => t.formatted_name) : []
        }
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
        defaultValue={new Date()}
        info={FORM_MESSAGES.DATE.INFO}
      />
    </Form>
  );
};
