import { Icon, List } from '@raycast/api';

import  { Entry, Filter } from "./types";
import { useEntries } from './hooks/useEntries';

export default function Command() {

  const { isLoading, filter, entries, setState} = useEntries();

  const handleChangeFilter = (value: Filter) => {
    setState({ isLoading: true, filter: value, entries: [] });
  }

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Day"
          value={filter}
          onChange={(newValue) => handleChangeFilter(newValue as Filter)}
        >
          <List.Dropdown.Item title={Filter.Yesterday} value={Filter.Yesterday} />
          <List.Dropdown.Item title={Filter.Today} value={Filter.Today} />
          <List.Dropdown.Item title={Filter.Tomorrow} value={Filter.Tomorrow} />
        </List.Dropdown>
      }
      isLoading={isLoading}
      isShowingDetail>
      {entries.map((entry: Entry) => (
        <List.Item
          key={entry.id}
          title={entry.project.name}
          icon={{
            source: Icon.CircleFilled,
            tintColor: entry.project.color
          }}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Description" text={entry.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Tags" text={entry.tags.map((tag) => tag.formatted_name).join(', ')} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Project" text={entry.project.name} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Time" text={entry.formatted_minutes} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Date" text={entry.date} />
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
