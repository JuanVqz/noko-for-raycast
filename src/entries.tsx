import { List } from "@raycast/api";

import { EntryType, EntryDateEnum } from "./types";

import { useEntries } from "./hooks";

import { Entry } from "./components";

export default function Command() {
  const { isLoading, filter, filteredEntries, setFilter } = useEntries();

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Day"
          value={filter}
          onChange={(newValue) => setFilter(newValue as EntryDateEnum)}
        >
          {Object.values(EntryDateEnum).map((value) => (
            <List.Dropdown.Item key={value} title={value} value={value} />
          ))}
        </List.Dropdown>
      }
      isLoading={isLoading}
      isShowingDetail
    >
      {filteredEntries.map((entry: EntryType) => (
        <Entry key={entry.id} entry={entry} />
      ))}
    </List>
  );
}
