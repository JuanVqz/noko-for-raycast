import { List } from '@raycast/api';

import  { Entry as TEntry, Filter } from "./types";

import { useEntries } from './hooks';

import { Entry } from './components';

export default function Command() {
  const { isLoading, filter, entries, setState} = useEntries();

  const handleChangeFilter = (value: Filter) => {
    setState({ filter: value, entries: [] });
  }

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Day"
          value={filter}
          onChange={(newValue) => handleChangeFilter(newValue as Filter)}
        >
          {Object.values(Filter).map((value) => (
            <List.Dropdown.Item key={value} title={value} value={value} />
          ))}
        </List.Dropdown>
      }
      isLoading={isLoading}
      isShowingDetail
    >
      {entries.map((entry: TEntry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
    </List>
  );
}
