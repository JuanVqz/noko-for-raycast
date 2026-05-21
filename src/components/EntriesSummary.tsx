import {
  List,
  ActionPanel,
  Action,
  Icon,
  getPreferenceValues,
} from "@raycast/api";
import { useMemo } from "react";
import { EntryType, IPreferences } from "../types";
import {
  getEntriesSummary,
  getWeekSummary,
  getDailyBreakdown,
  getWeeklyGoalProgress,
} from "../utils";
import { SUMMARY_COLORS } from "../constants";
import { WeekDailyBreakdown } from "./WeekDailyBreakdown";

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
  const { weeklyGoalHours } = getPreferenceValues<IPreferences>();
  const goalHours = weeklyGoalHours ? parseFloat(weeklyGoalHours) : null;

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

  const dailyBreakdown = useMemo(() => {
    if (!weekEntries || !Array.isArray(weekEntries)) {
      return [];
    }
    return getDailyBreakdown(weekEntries);
  }, [weekEntries]);

  const goalProgress = useMemo(() => {
    if (!goalHours || !weekEntries || !Array.isArray(weekEntries)) {
      return null;
    }
    return getWeeklyGoalProgress(weekEntries, goalHours);
  }, [weekEntries, goalHours]);

  const shouldShowSummary =
    (summary && summary.exists) || (weekSummary && weekSummary.exists);

  if (!shouldShowSummary) {
    return null;
  }

  return (
    <List.Section title="Summary">
      {goalProgress && (
        <List.Item
          title={`Goal: ${goalProgress.logged} / ${goalProgress.goal}`}
          subtitle={`${goalProgress.percentage}% complete`}
          icon={{
            source: goalProgress.met ? Icon.CheckCircle : Icon.Clock,
            tintColor: goalProgress.met
              ? SUMMARY_COLORS.BILLABLE
              : SUMMARY_COLORS.UNBILLABLE,
          }}
        />
      )}
      {summary && summary.exists && (
        <List.Item
          id="summary-today"
          title={summary.title}
          subtitle={summary.subtitle}
          accessories={[
            {
              icon: { source: Icon.Coins, tintColor: SUMMARY_COLORS.BILLABLE },
              text: summary.billable,
            },
            {
              icon: {
                source: Icon.Coins,
                tintColor: SUMMARY_COLORS.UNBILLABLE,
              },
              text: summary.unbillable,
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
      {weekSummary && weekSummary.exists && (
        <List.Item
          id="summary-week"
          title={weekSummary.title}
          subtitle={weekSummary.subtitle}
          accessories={[
            {
              icon: { source: Icon.Coins, tintColor: SUMMARY_COLORS.BILLABLE },
              text: weekSummary.billable,
            },
            {
              icon: {
                source: Icon.Coins,
                tintColor: SUMMARY_COLORS.UNBILLABLE,
              },
              text: weekSummary.unbillable,
            },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Daily Breakdown"
                icon={Icon.Calendar}
                target={<WeekDailyBreakdown rows={dailyBreakdown} />}
              />
            </ActionPanel>
          }
        />
      )}
    </List.Section>
  );
};
