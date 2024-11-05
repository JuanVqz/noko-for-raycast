import { Icon, List } from '@raycast/api';
import { EntryType } from "../types";

const Entry: React.FC<{entry: EntryType}> = ({ entry }) => {
  return (
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
              <List.Item.Detail.Metadata.Label title="Description" />
              <List.Item.Detail.Metadata.Label title={entry.description} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Tags" text={entry.tags.map((tag) => tag.formatted_name).join(', ')} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Project" text={entry.project.name} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Date" text={entry.date} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Enabled" text={entry.project.enabled ? 'Yes' : 'No'} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Billable" text={entry.billable ? 'Yes' : 'No'} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="User" icon={entry.user.profile_image_url} text={`${entry.user.first_name} ${entry.user.last_name} <${entry.user.email}>`} />
              <List.Item.Detail.Metadata.Separator />
              {entry.approved_by && (
                <>
                  <List.Item.Detail.Metadata.Label title="Approved By" icon={entry.approved_by.profile_image_url} text={`${entry.approved_by.first_name} ${entry.approved_by.last_name} <${entry.approved_by.email}>`} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Approved At" text={entry.approved_at} />
                  <List.Item.Detail.Metadata.Separator />
                </>
              )}
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
}

export default Entry;
