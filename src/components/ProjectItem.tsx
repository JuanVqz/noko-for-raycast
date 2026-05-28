import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { memo } from "react";
import { ProjectType } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";
import { hoursFormat } from "../utils/time-utils";

interface ProjectItemProps {
  project: ProjectType;
  weekMinutes?: number;
  onAddEntry: (project: ProjectType) => void;
  onViewEntries: () => void;
  onTimerChange?: () => void;
}

const ProjectItem = memo<ProjectItemProps>(
  ({ project, weekMinutes, onAddEntry, onViewEntries, onTimerChange }) => {
    const { startTimer } = useTimerActions({
      onSuccess: onTimerChange,
    });

    return (
      <List.Item
        title={project.name}
        icon={{
          source: Icon.CircleFilled,
          tintColor: project.color,
        }}
        subtitle={
          project.billing_increment ? `${project.billing_increment}m` : ""
        }
        accessories={[
          ...(weekMinutes !== undefined && weekMinutes > 0
            ? [
                {
                  icon: Icon.Clock,
                  text: hoursFormat(weekMinutes),
                  tooltip: "This Week",
                },
              ]
            : []),
          ...(project.entries != null
            ? [
                {
                  tag: { value: String(project.entries), color: project.color },
                  tooltip: "Entries",
                },
              ]
            : []),
          project.billable
            ? {
                icon: { source: Icon.Coins, tintColor: "#10B981" },
                tooltip: "Billable",
              }
            : {
                icon: { source: Icon.Coins, tintColor: "#EF4444" },
                tooltip: "Not Billable",
              },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Start Timer"
              icon={Icon.Play}
              onAction={() => startTimer(project)}
            />
            <Action
              title="Add Entry"
              icon={Icon.Plus}
              onAction={() => onAddEntry(project)}
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

ProjectItem.displayName = "ProjectItem";

export { ProjectItem };
