import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { memo, useMemo } from "react";
import { ProjectType, TimerType, TimerStateEnum } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";
import useElapsedTime from "../hooks/useElapsedTime";

interface TimerItemProps {
  project: ProjectType;
  isShowingDetail: boolean;
  onToggleDetail: () => void;
  onAddEntry: () => void;
  onViewEntries: () => void;
  onTimerChange?: () => void;
  onLogTimer?: (project: ProjectType, timer: TimerType) => void;
}

const TimerItem = memo<TimerItemProps>(
  ({
    project,
    isShowingDetail,
    onToggleDetail,
    onAddEntry,
    onViewEntries,
    onTimerChange,
    onLogTimer,
  }) => {
    const elapsedTime = useElapsedTime(project.timer || null);

    const { startTimer, pauseTimer, discardTimer } = useTimerActions({
      onSuccess: onTimerChange,
    });

    const subtitle = useMemo(() => {
      if (!project.timer) {
        return "";
      }

      const state =
        project.timer.state === TimerStateEnum.Running ? "Running" : "Paused";
      const time = elapsedTime || project.timer.formatted_time || "0:00:00";
      return `${state} - ${time}`;
    }, [project.timer, elapsedTime]);

    const timerActions = useMemo(() => {
      if (!project.timer) {
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
              onAction={() => pauseTimer(project.timer!)}
            />
            <Action
              title="Log Timer"
              icon={Icon.Stop}
              onAction={() => onLogTimer?.(project, project.timer!)}
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
            onAction={() => onLogTimer?.(project, project.timer!)}
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

    const detailMetadata = useMemo(
      () => (
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label
            title="Project"
            text={project.name}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Status"
            text={
              project.timer
                ? project.timer.state === TimerStateEnum.Running
                  ? "Running"
                  : "Paused"
                : "No Timer"
            }
          />
          <List.Item.Detail.Metadata.Separator />
          {project.timer && (
            <>
              <List.Item.Detail.Metadata.Label
                title="Time"
                text={elapsedTime || project.timer.formatted_time}
              />
              <List.Item.Detail.Metadata.Separator />
              {project.timer.description && (
                <>
                  <List.Item.Detail.Metadata.Label
                    title="Description"
                    text={project.timer.description}
                  />
                  <List.Item.Detail.Metadata.Separator />
                </>
              )}
            </>
          )}
          <List.Item.Detail.Metadata.Label
            title="Enabled"
            text={project.enabled ? "Yes" : "No"}
          />
          {project.billing_increment && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Billing Increment"
                text={`${project.billing_increment} minutes`}
              />
            </>
          )}
        </List.Item.Detail.Metadata>
      ),
      [project, elapsedTime],
    );

    return (
      <List.Item
        title={project.name}
        subtitle={subtitle}
        icon={{
          source: Icon.CircleFilled,
          tintColor: project.color,
        }}
        detail={<List.Item.Detail metadata={detailMetadata} />}
        actions={
          <ActionPanel>
            {timerActions}
            <Action
              title={isShowingDetail ? "Hide Details" : "Show Details"}
              icon={Icon.Info}
              onAction={onToggleDetail}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
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
