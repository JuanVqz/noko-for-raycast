import { Icon, List, ActionPanel, Action } from "@raycast/api";
import { memo, useMemo } from "react";
import { TimerType } from "../types";
import { userName } from "../utils";
import { useElapsedTime } from "../hooks/useElapsedTime";

interface TimerDisplayProps {
  timer: TimerType;
  isShowingDetail: boolean;
  onToggleDetail: () => void;
}

export const TimerDisplay = memo<TimerDisplayProps>(
  ({ timer, isShowingDetail, onToggleDetail }) => {
    const elapsedTime = useElapsedTime(timer);

    const detailMetadata = useMemo(
      () => (
        <List.Item.Detail.Metadata>
          {timer.project && (
            <>
              <List.Item.Detail.Metadata.Label
                title="Project"
                text={timer.project.name}
              />
              <List.Item.Detail.Metadata.Separator />
            </>
          )}
          {timer.date && (
            <>
              <List.Item.Detail.Metadata.Label title="Date" text={timer.date} />
              <List.Item.Detail.Metadata.Separator />
            </>
          )}
          {timer.user && (
            <>
              <List.Item.Detail.Metadata.Label
                title="User"
                icon={timer.user.profile_image_url}
                text={userName(timer.user)}
              />
              <List.Item.Detail.Metadata.Separator />
            </>
          )}
          {timer.description && (
            <>
              <List.Item.Detail.Metadata.Label title="Description" />
              <List.Item.Detail.Metadata.Label title={timer.description} />
              <List.Item.Detail.Metadata.Separator />
            </>
          )}
          <List.Item.Detail.Metadata.Label
            title="Status"
            text={timer.state === "running" ? "Running" : "Paused"}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Time"
            text={elapsedTime || timer.formatted_time}
          />
        </List.Item.Detail.Metadata>
      ),
      [timer, elapsedTime],
    );

    return (
      <List.Item
        key={timer.id}
        title={timer.project.name}
        subtitle={elapsedTime || ""}
        icon={{
          source: Icon.CircleFilled,
          tintColor: timer.project.color,
        }}
        detail={<List.Item.Detail metadata={detailMetadata} />}
        actions={
          <ActionPanel>
            <Action
              title={isShowingDetail ? "Hide Details" : "Show Details"}
              onAction={onToggleDetail}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
          </ActionPanel>
        }
      />
    );
  },
);

TimerDisplay.displayName = "TimerDisplay";
