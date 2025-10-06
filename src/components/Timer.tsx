import { Icon, List } from "@raycast/api";
import { TimerType } from "../types";

const Timer: React.FC<{ timer: TimerType }> = ({ timer }) => {
  return (
    <List.Item
      key={timer.id}
      title={timer.project.name}
      subtitle={timer.formatted_time}
      icon={{
        source: Icon.CircleFilled,
        tintColor: timer.project.color,
      }}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Description" />
              <List.Item.Detail.Metadata.Label title={timer.description} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Project"
                text={timer.project.name}
              />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Date" text={timer.date} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="User"
                icon={timer.user.profile_image_url}
                text={`${timer.user.first_name} ${timer.user.last_name} <${timer.user.email}>`}
              />
              <List.Item.Detail.Metadata.Separator />
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
};

export default Timer;
