import { Form, ActionPanel, Action, Icon } from "@raycast/api";
import { useMemo, useCallback, useState, useEffect } from "react";
import { EntryFormData, ProjectType } from "../types";
import { useProjects, useTags, useTimer } from "../hooks/useApiData";
import { useEntrySubmission, useTimerActions } from "../hooks";
import { apiClient } from "../lib/api-client";
import {
  formatMinutesAsTime,
  convertElapsedTimeToMinutes,
  getElapsedTime,
  showSuccessToast,
  showErrorToast,
} from "../utils";
import { TOAST_MESSAGES, TIME_DEFAULTS, FORM_MESSAGES } from "../constants";

type AddEntryViewProps = {
  onSubmit?: () => void;
  onCancel?: () => void;
  project: ProjectType | null;
  // True only when arriving from a running/paused timer (Log Timer flow).
  // ProjectItem's Add Entry preselects the project but leaves this false so
  // the form uses default time and the regular entry-submit path.
  hasRunningTimer?: boolean;
};

export const AddEntryView = ({
  onSubmit,
  onCancel,
  project,
  hasRunningTimer = false,
}: AddEntryViewProps) => {
  const { data: projects = [] } = useProjects();
  const { data: tags = [] } = useTags();
  const isTimerMode = project !== null && hasRunningTimer;
  const { data: timer, isLoading: timerLoading } = useTimer(
    isTimerMode ? project.id : null,
  );
  const { submitEntry } = useEntrySubmission({
    onSuccess: onSubmit,
  });
  const { logTimer } = useTimerActions();

  const [minutesValue, setMinutesValue] = useState<string>(
    TIME_DEFAULTS.DEFAULT_TIME_FORMAT,
  );

  useEffect(() => {
    if (isTimerMode && timer && !timerLoading) {
      const currentTime = new Date();
      const fetchTime = new Date();
      const elapsedTime = getElapsedTime(timer, currentTime, fetchTime);
      const minutes = convertElapsedTimeToMinutes(elapsedTime);
      setMinutesValue(formatMinutesAsTime(minutes));
    }
  }, [isTimerMode, timer, timerLoading]);

  const handleSubmit = useCallback(
    async (values: EntryFormData) => {
      try {
        if (isTimerMode) {
          const selectedProject = projects.find(
            (p) => p.name === values.project_name,
          );
          const projectChanged =
            selectedProject && selectedProject.id !== project.id;

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
          } else {
            const ok = await logTimer(project.id, values);
            if (!ok) return;
            showSuccessToast(
              TOAST_MESSAGES.SUCCESS.TIMER_LOGGED,
              `Timer logged for ${project.name}`,
            );
            onSubmit?.();
          }
        } else {
          await submitEntry(values);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : TOAST_MESSAGES.ERROR.UNKNOWN_ERROR;
        showErrorToast(TOAST_MESSAGES.ERROR.INVALID_INPUT, errorMessage);
      }
    },
    [isTimerMode, project, projects, logTimer, submitEntry, onSubmit],
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
        defaultValue={project?.name ?? ""}
        storeValue={project === null}
        autoFocus={project === null}
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
        placeholder={FORM_MESSAGES.DESCRIPTION.PLACEHOLDER}
        autoFocus={project !== null}
        info={
          isTimerMode
            ? FORM_MESSAGES.DESCRIPTION.INFO_TIMER
            : FORM_MESSAGES.DESCRIPTION.INFO_MANUAL
        }
      />

      <Form.TagPicker
        id="tags"
        title="Tags"
        defaultValue={[]}
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
