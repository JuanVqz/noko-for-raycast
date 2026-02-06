import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { useMemo } from "react";
import { EntryType } from "../types";
import { getEntriesSummary, getWeekSummary } from "../utils";

interface EntriesSummaryProps {
  entries: EntryType[] | null;
  weekEntries?: EntryType[] | null;
  onCancel?: () => void;
}

export const EntriesSummary = ({
  entries,
  weekEntries,
  onCancel,
}: EntriesSummaryProps) => {
  const summary = useMemo(() => {
    if (!entries || !Array.isArray(entries)) {
      return null;
    }
    return getEntriesSummary(entries);
  }, [entries]);

  const weekSummary = useMemo(() => {
    if (!weekEntries || !Array.isArray(weekEntries)) {
      return null;
    }
    return getWeekSummary(weekEntries);
  }, [weekEntries]);

  const shouldShowSummary =
    (summary && summary.exists) || (weekSummary && weekSummary.exists);

  if (!shouldShowSummary) {
    return null;
  }

  return (
    <List.Section title="Summary">
      {weekSummary && weekSummary.exists && (
        <List.Item
          title={weekSummary.title}
          subtitle={weekSummary.subtitle}
          accessories={[
            {
              icon: { source: Icon.Coins, tintColor: "#10B981" },
              text: weekSummary.billable,
            },
            {
              icon: { source: Icon.Minus, tintColor: "#EF4444" },
              text: weekSummary.unbillable,
            },
          ]}
          actions={
            <ActionPanel>
              {onCancel && (
                <Action
                  title="Back"
                  icon={Icon.ArrowLeft}
                  onAction={onCancel}
                  shortcut={{ modifiers: ["cmd"], key: "[" }}
                />
              )}
            </ActionPanel>
          }
        />
      )}
      {summary && summary.exists && (
        <List.Item
          title={summary.title}
          subtitle={summary.subtitle}
          accessories={[
            {
              icon: { source: Icon.Coins, tintColor: "#10B981" },
              text: summary.billable,
            },
            {
              icon: { source: Icon.Minus, tintColor: "#EF4444" },
              text: summary.unbillable,
            },
          ]}
        />
      )}
    </List.Section>
  );
};
