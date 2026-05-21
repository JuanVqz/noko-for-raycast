import {
  Icon,
  List,
  ActionPanel,
  Action,
  Alert,
  Color,
  confirmAlert,
} from "@raycast/api";
import { memo, useMemo, useCallback } from "react";
import { TimerStateEnum, TimerType } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";
import useElapsedTime from "../hooks/useElapsedTime";

interface TimerItemProps {
  timer: TimerType;
  onAddEntry: () => void;
  onViewEntries: () => void;
  onLogTimer: (project: TimerType["project"]) => void;
  onTimerChange?: () => void;
}

const TimerItem = memo<TimerItemProps>(
  ({ timer, onAddEntry, onViewEntries, onLogTimer, onTimerChange }) => {
    const currentProject = timer.project;

    const elapsedTime = useElapsedTime(timer);

    const { startTimer, pauseTimer, discardTimer, resetTimer } =
      useTimerActions({
        onSuccess: onTimerChange,
      });

    const subtitle = useMemo(() => elapsedTime, [elapsedTime]);

    const handleDiscard = useCallback(async () => {
      const confirmed = await confirmAlert({
        title: "Discard Timer",
        message: `Are you sure you want to discard the timer for "${currentProject.name}"? This cannot be undone.`,
        primaryAction: {
          title: "Discard",
          style: Alert.ActionStyle.Destructive,
        },
      });
      if (confirmed) {
        await discardTimer(currentProject);
      }
    }, [currentProject, discardTimer]);

    const handleReset = useCallback(async () => {
      const confirmed = await confirmAlert({
        title: "Reset Timer",
        message: `Are you sure you want to reset the timer for "${currentProject.name}"? The current time will be lost.`,
        primaryAction: { title: "Reset", style: Alert.ActionStyle.Destructive },
      });
      if (confirmed) {
        await resetTimer(currentProject);
      }
    }, [currentProject, resetTimer]);

    const timerActions = useMemo(() => {
      if (timer.state === TimerStateEnum.Running) {
        return (
          <>
            <Action
              title="Pause Timer"
              icon={Icon.Pause}
              onAction={() => pauseTimer(currentProject)}
            />
            <Action
              title="Log Timer"
              icon={Icon.Stop}
              onAction={() => onLogTimer(currentProject)}
            />
            <Action
              title="Reset Timer"
              icon={Icon.ArrowClockwise}
              onAction={handleReset}
              style={Action.Style.Destructive}
            />
            <Action
              title="Discard Timer"
              icon={Icon.Trash}
              onAction={handleDiscard}
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
            onAction={() => startTimer(currentProject)}
          />
          <Action
            title="Log Timer"
            icon={Icon.Stop}
            onAction={() => onLogTimer(currentProject)}
          />
          <Action
            title="Reset Timer"
            icon={Icon.ArrowClockwise}
            onAction={handleReset}
            style={Action.Style.Destructive}
          />
          <Action
            title="Discard Timer"
            icon={Icon.Trash}
            onAction={handleDiscard}
            style={Action.Style.Destructive}
          />
        </>
      );
    }, [
      timer.state,
      currentProject,
      startTimer,
      pauseTimer,
      handleDiscard,
      handleReset,
      onLogTimer,
    ]);

    const stateTag =
      timer.state === TimerStateEnum.Running
        ? { tag: { value: "Running", color: Color.Green } }
        : { tag: { value: "Paused", color: Color.Yellow } };

    return (
      <List.Item
        title={currentProject.name}
        subtitle={subtitle}
        accessories={[stateTag]}
        icon={{
          source: Icon.CircleFilled,
          tintColor: currentProject.color,
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
