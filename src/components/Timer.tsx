import { Icon, List } from "@raycast/api";
import { useState, useEffect } from "react";
import { TimerType, TimerStateEnum } from "../types";
import { getElapsedTime, formatUserDisplayName } from "../utils";

const Timer: React.FC<{ timer: TimerType }> = ({ timer }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fetchTime] = useState(new Date());

  useEffect(() => {
    if (timer.state !== TimerStateEnum.Running) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.state]);


  return (
    <List.Item
      key={timer.id}
      title={getElapsedTime(timer, currentTime, fetchTime)}
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
                  <List.Item.Detail.Metadata.Label title="Date" text={timer.date} />
                  <List.Item.Detail.Metadata.Separator />
                </>
              )}
              {timer.user && (
                <>
                  <List.Item.Detail.Metadata.Label
                    title="User"
                    icon={timer.user.profile_image_url}
                    text={formatUserDisplayName(timer.user)}
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
};

export default Timer;
