import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { EntryType, EntryDateEnum } from "../types";
import { useEntries, useDetailToggle } from "../hooks";
import Entry from "./Entry";

interface EntriesListProps {
  onClose?: () => void;
}

export default function EntriesList({ onClose }: EntriesListProps) {
  const { isLoading, filter, filteredEntries, setFilter } = useEntries();
  const { isShowingDetail, toggleDetail } = useDetailToggle(false);

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
      isShowingDetail={isShowingDetail}
      actions={
        <ActionPanel>
          {onClose && (
            <Action
              title="Back to Projects"
              icon={Icon.ArrowLeft}
              onAction={onClose}
              shortcut={{ modifiers: ["cmd"], key: "b" }}
            />
          )}
        </ActionPanel>
      }
    >
      {filteredEntries.map((entry: EntryType) => (
        <Entry
          key={entry.id}
          entry={entry}
          isShowingDetail={isShowingDetail}
          onToggleDetail={toggleDetail}
        />
      ))}
    </List>
  );
}
