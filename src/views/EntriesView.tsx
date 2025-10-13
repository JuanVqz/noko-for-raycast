import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { EntryType, EntryDateEnum } from "../types";
import { useEntries, useDetailToggle } from "../hooks";
import { EntryItem } from "../components/EntryItem";
import { UI_MESSAGES } from "../constants";

interface EntriesViewProps {
  onCancel?: () => void;
}

export const EntriesView = ({ onCancel }: EntriesViewProps) => {
  const { isLoading, filter, filteredEntries, setFilter, error } = useEntries();
  const { isShowingDetail, toggleDetail } = useDetailToggle(false);

  const handleFilterChange = useCallback(
    (newValue: string) => {
      // Validate that the newValue is a valid EntryDateEnum value
      if (Object.values(EntryDateEnum).includes(newValue as EntryDateEnum)) {
        setFilter(newValue as EntryDateEnum);
      }
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
        onCancel={onCancel}
      />
    ));
  }, [filteredEntries, isShowingDetail, toggleDetail, onCancel]);

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
          {onCancel && (
            <Action
              title="Cancel"
              icon={Icon.ArrowLeft}
              onAction={onCancel}
              shortcut={{ modifiers: ["shift", "cmd"], key: "enter" }}
            />
          )}
        </ActionPanel>
      }
    >
      {error ? (
        <List.EmptyView
          title={UI_MESSAGES.ENTRIES.ERROR_TITLE}
          description={error.message || UI_MESSAGES.ENTRIES.ERROR_DESCRIPTION}
        />
      ) : (
        entryItems
      )}
    </List>
  );
};
