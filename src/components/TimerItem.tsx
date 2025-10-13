import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { memo, useMemo } from "react";
import { ProjectType, TimerStateEnum } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";
import useElapsedTime from "../hooks/useElapsedTime";
import { isTimerNull } from "../utils";

interface TimerItemProps {
  project: ProjectType;
  onAddEntry: () => void;
  onViewEntries: () => void;
  onLogTimer: (project: ProjectType) => void;
  onTimerChange?: () => void;
}

const TimerItem = memo<TimerItemProps>(
  ({ project, onAddEntry, onViewEntries, onLogTimer, onTimerChange }) => {
    const elapsedTime = useElapsedTime(project.timer);

    const { startTimer, pauseTimer, discardTimer } = useTimerActions({
      onSuccess: onTimerChange,
    });

    const subtitle = useMemo(() => {
      if (isTimerNull(project.timer)) {
        return "";
      }

      const state =
        project.timer.state === TimerStateEnum.Running ? "Running" : "Paused";
      return `${state} - ${elapsedTime}`;
    }, [project.timer.state, elapsedTime]);

    const timerActions = useMemo(() => {
      if (isTimerNull(project.timer)) {
        return (
          <Action
            title="Start Timer"
            icon={Icon.Play}
            onAction={() => startTimer(project)}
          />
        );
      }

      if (project.timer.state === TimerStateEnum.Running) {
        return (
          <>
            <Action
              title="Pause Timer"
              icon={Icon.Pause}
              onAction={() => pauseTimer(project)}
            />
            <Action
              title="Log Timer"
              icon={Icon.Stop}
              onAction={() => onLogTimer(project)}
            />
            <Action
              title="Discard Timer"
              icon={Icon.Trash}
              onAction={() => discardTimer(project)}
              style={Action.Style.Destructive}
            />
          </>
        );
      }

      // Paused timer actions
      return (
        <>
          <Action
            title="Resume Timer"
            icon={Icon.Play}
            onAction={() => startTimer(project)}
          />
          <Action
            title="Log Timer"
            icon={Icon.Stop}
            onAction={() => onLogTimer(project)}
          />
          <Action
            title="Discard Timer"
            icon={Icon.Trash}
            onAction={() => discardTimer(project)}
            style={Action.Style.Destructive}
          />
        </>
      );
    }, [project, startTimer, pauseTimer, discardTimer, onLogTimer]);

    return (
      <List.Item
        title={project.name}
        subtitle={subtitle}
        icon={{
          source: Icon.CircleFilled,
          tintColor: project.color,
        }}
        actions={
          <ActionPanel>
            {timerActions}
            <Action
              title="Add Entry"
              icon={Icon.Plus}
              onAction={onAddEntry}
              shortcut={{ modifiers: ["cmd"], key: "n" }}
            />
            <Action
              title="View Entries"
              icon={Icon.List}
              onAction={onViewEntries}
              shortcut={{ modifiers: ["cmd"], key: "e" }}
            />
          </ActionPanel>
        }
      />
    );
  },
);

TimerItem.displayName = "TimerItem";

export { TimerItem };
