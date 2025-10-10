import { Icon, List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { memo } from "react";
import { ProjectType } from "../types";
import { useTimerControls } from "../hooks";
import useElapsedTimeSafe from "../hooks/useElapsedTimeSafe";

interface ProjectItemProps {
  project: ProjectType;
  isShowingDetail: boolean;
  onToggleDetail: () => void;
  onAddEntry: () => void;
  onViewEntries: () => void;
  onTimerChange?: () => void;
}

const ProjectItem = memo<ProjectItemProps>(({
  project,
  isShowingDetail,
  onToggleDetail,
  onAddEntry,
  onViewEntries,
  onTimerChange
}) => {
  // Use the safe hook that handles null timers
  const elapsedTime = useElapsedTimeSafe(project.timer || null);

  const { handleStartTimer, handlePauseTimer, handleStopTimer } = useTimerControls(onTimerChange);

  const getSubtitle = () => {
    if (!project.timer) {
      return "";
    }

    const state = project.timer.state === "running" ? "Running" : "Paused";
    const time = elapsedTime || project.timer.formatted_time || "0:00:00";

    return `${state} - ${time}`;
  };

  const getActions = () => {
    if (!project.timer) {
      return (
        <Action
          title="Start Timer"
          icon={Icon.Play}
          onAction={() => handleStartTimer(project)}
        />
      );
    }

    if (project.timer.state === "running") {
      return (
        <>
          <Action
            title="Pause Timer"
            icon={Icon.Pause}
            onAction={() => handlePauseTimer(project.timer!)}
          />
          <Action
            title="Stop Timer"
            icon={Icon.Stop}
            onAction={() => handleStopTimer(project.timer!)}
          />
        </>
      );
    } else {
      // For paused timers, show Resume and Stop options
      return (
        <>
          <Action
            title="Resume Timer"
            icon={Icon.Play}
            onAction={() => handleStartTimer(project)}
          />
          <Action
            title="Stop Timer"
            icon={Icon.Stop}
            onAction={() => handleStopTimer(project.timer!)}
          />
        </>
      );
    }
  };

  return (
    <List.Item
      key={project.id}
      title={project.name}
      subtitle={getSubtitle()}
      icon={{
        source: Icon.CircleFilled,
        tintColor: project.color,
      }}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label
                title="Project"
                text={project.name}
              />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Status"
                text={project.timer ? (project.timer.state === "running" ? "Running" : "Paused") : "No Timer"}
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
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          {getActions()}
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
});

ProjectItem.displayName = "ProjectItem";

export default ProjectItem;
