import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { EntryType, EntryDateEnum } from "../types";
import { useEntries, useDetailToggle } from "../hooks";
import { EntryItem } from "./EntryItem";

interface EntriesViewProps {
  onClose?: () => void;
}

export const EntriesView = ({ onClose }: EntriesViewProps) => {
  const { isLoading, filter, filteredEntries, setFilter, error } = useEntries();
  const { isShowingDetail, toggleDetail } = useDetailToggle(false);

  const handleFilterChange = useCallback(
    (newValue: string) => {
      setFilter(newValue as EntryDateEnum);
    },
    [setFilter],
  );

  const dropdownItems = useMemo(() => {
    return Object.values(EntryDateEnum).map((value) => (
      <List.Dropdown.Item key={value} title={value} value={value} />
    ));
  }, []);

  const entryItems = useMemo(() => {
    if (!filteredEntries || !Array.isArray(filteredEntries)) {
      return [];
    }
    return filteredEntries.map((entry: EntryType) => (
      <EntryItem
        key={entry.id}
        entry={entry}
        isShowingDetail={isShowingDetail}
        onToggleDetail={toggleDetail}
      />
    ));
  }, [filteredEntries, isShowingDetail, toggleDetail]);

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Day"
          value={filter}
          onChange={handleFilterChange}
        >
          {dropdownItems}
        </List.Dropdown>
      }
      isLoading={isLoading}
      isShowingDetail={isShowingDetail}
      actions={
        <ActionPanel>
          {onClose && (
            <Action
              title="Back to Timers"
              icon={Icon.ArrowLeft}
              onAction={onClose}
              shortcut={{ modifiers: ["cmd"], key: "b" }}
            />
          )}
        </ActionPanel>
      }
    >
      {error ? (
        <List.EmptyView
          title="Error Loading Entries"
          description={error.message || "Failed to load entries. Please try again."}
        />
      ) : (
        entryItems
      )}
    </List>
  );
};
