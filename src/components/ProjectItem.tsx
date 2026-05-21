import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { memo } from "react";
import { ProjectType } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";

interface ProjectItemProps {
  project: ProjectType;
  onAddEntry: () => void;
  onViewEntries: () => void;
  onTimerChange?: () => void;
}

const ProjectItem = memo<ProjectItemProps>(
  ({ project, onAddEntry, onViewEntries, onTimerChange }) => {
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
        accessories={[
          ...(project.billing_increment
            ? [{ tag: { value: `${project.billing_increment}m` }, tooltip: "Billing increment" }]
            : []),
          ...(project.entries != null
            ? [{ tag: { value: String(project.entries) }, tooltip: "Entries" }]
            : []),
          project.billable
            ? { icon: { source: Icon.Coins, tintColor: "#10B981" }, tooltip: "Billable" }
            : { icon: { source: Icon.Coins, tintColor: "#EF4444" }, tooltip: "Not Billable" },
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

ProjectItem.displayName = "ProjectItem";

export { ProjectItem };
