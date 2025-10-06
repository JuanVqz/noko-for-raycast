import { Icon, List } from "@raycast/api";
import { memo } from "react";
import { TimerType } from "../types";
import { userName } from "../utils";
import { useElapsedTime } from "../hooks";

const Timer = memo<{ timer: TimerType }>(({ timer }) => {
  const elapsedTime = useElapsedTime(timer);

  return (
    <List.Item
      key={timer.id}
      title={elapsedTime}
      icon={{
        source: Icon.CircleFilled,
        tintColor: timer.project.color,
      }}
      detail={
        <List.Item.Detail
          metadata={
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
                  <List.Item.Detail.Metadata.Label
                    title="Date"
                    text={timer.date}
                  />
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
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
});

Timer.displayName = "Timer";

export default Timer;
