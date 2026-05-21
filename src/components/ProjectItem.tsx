import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { memo } from "react";
import { ProjectType } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";
import { hoursFormat } from "../utils/time-utils";

interface ProjectItemProps {
  project: ProjectType;
  weekMinutes?: number;
  isShowingDetail?: boolean;
  onToggleDetail?: () => void;
  onAddEntry: () => void;
  onViewEntries: () => void;
  onTimerChange?: () => void;
}

const ProjectItem = memo<ProjectItemProps>(
  ({
    project,
    weekMinutes,
    isShowingDetail,
    onToggleDetail,
    onAddEntry,
    onViewEntries,
    onTimerChange,
  }) => {
    const { startTimer } = useTimerActions({
      onSuccess: onTimerChange,
    });

    const detailMetadata = (
      <List.Item.Detail.Metadata>
        <List.Item.Detail.Metadata.Label
          title="Status"
          text={project.enabled ? "Active" : "Archived"}
        />
        <List.Item.Detail.Metadata.Separator />
        {project.billing_increment !== undefined &&
          project.billing_increment > 0 && (
            <>
              <List.Item.Detail.Metadata.Label
                title="Billing Increment"
                text={`${project.billing_increment} min`}
              />
              <List.Item.Detail.Metadata.Separator />
            </>
          )}
        {weekMinutes !== undefined && (
          <>
            <List.Item.Detail.Metadata.Label
              title="This Week"
              text={
                weekMinutes > 0 ? hoursFormat(weekMinutes) : "No time logged"
              }
            />
            <List.Item.Detail.Metadata.Separator />
          </>
        )}
        <List.Item.Detail.Metadata.Label title="Color" text={project.color} />
      </List.Item.Detail.Metadata>
    );

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
        detail={<List.Item.Detail metadata={detailMetadata} />}
        actions={
          <ActionPanel>
            <Action
              title="Start Timer"
              icon={Icon.Play}
              onAction={() => startTimer(project)}
            />
            {onToggleDetail && (
              <Action
                title={isShowingDetail ? "Hide Details" : "Show Details"}
                icon={Icon.Sidebar}
                onAction={onToggleDetail}
                shortcut={{ modifiers: ["cmd"], key: "d" }}
              />
            )}
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
