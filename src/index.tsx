import { Icon, List } from '@raycast/api';

import  { Entry } from "./types";
import { useEntries } from './hooks/useEntries';

export default function Command() {

  const { isLoading, entries } = useEntries();

  return (
    <List isLoading={isLoading} isShowingDetail>
      {entries.map((entry: Entry) => (
        <List.Item
          key={entry.id}
          title={entry.project.name}
          subtitle={entry.formatted_minutes}
          icon={{
            source: Icon.CircleFilled,
            tintColor: entry.project.color
          }}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Project" text={entry.project.name} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Time" text={entry.formatted_minutes} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Description" />
                  <List.Item.Detail.Metadata.Label title={entry.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Tags" text={entry.tags.map((tag) => tag.formatted_name).join(', ')} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Billable" text={entry.billable ? 'Yes' : 'No'} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="User" icon={entry.user.profile_image_url} text={`${entry.user.first_name} ${entry.user.last_name} <${entry.user.email}>`} />
                  <List.Item.Detail.Metadata.Separator />
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      ))}
    </List>
  );
}
