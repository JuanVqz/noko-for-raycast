import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { DailyBreakdownRowType, GoalProgressType } from "../types";
import { SUMMARY_COLORS } from "../constants";
import { dateOnTimezone } from "../utils";

interface WeekDailyBreakdownProps {
  rows: DailyBreakdownRowType[];
  goalProgress?: GoalProgressType | null;
}

export const WeekDailyBreakdown = ({
  rows,
  goalProgress,
}: WeekDailyBreakdownProps) => {
  const { pop } = useNavigation();
  // Noko entry dates are date-only strings; useWeekEntries fetches them with
  // dateOnTimezone bounds, so compare against the same timezone-adjusted today.
  const today = dateOnTimezone(new Date());

  const backAction = (
    <ActionPanel>
      <Action
        title="Back"
        icon={Icon.ArrowLeft}
        onAction={pop}
        shortcut={{ modifiers: ["cmd"], key: "[" }}
      />
    </ActionPanel>
  );

  return (
    <List navigationTitle="Weekly Breakdown">
      {goalProgress && (
        <List.Section title="Weekly Goal">
          <List.Item
            title={`Goal: ${goalProgress.logged} / ${goalProgress.goal}`}
            subtitle={`${goalProgress.percentage}% complete`}
            icon={{
              source: goalProgress.met ? Icon.CheckCircle : Icon.Clock,
              tintColor: goalProgress.met
                ? SUMMARY_COLORS.BILLABLE
                : SUMMARY_COLORS.UNBILLABLE,
            }}
            actions={backAction}
          />
        </List.Section>
      )}
      <List.Section title="Daily Breakdown">
        {rows.map((row) => (
          <List.Item
            key={row.date}
            title={`${row.dayLabel} ${row.date}   ${row.totalFormatted}`}
            subtitle={`${row.entryCount} ${
              row.entryCount === 1 ? "entry" : "entries"
            } • ${row.billablePercentage}% billable`}
            icon={Icon.Calendar}
            accessories={[
              ...(row.date === today
                ? [{ tag: { value: "Today", color: Color.Green } }]
                : []),
              {
                icon: {
                  source: Icon.Coins,
                  tintColor: SUMMARY_COLORS.BILLABLE,
                },
                text: row.billable,
              },
              {
                icon: {
                  source: Icon.Coins,
                  tintColor: SUMMARY_COLORS.UNBILLABLE,
                },
                text: row.unbillable,
              },
            ]}
            actions={backAction}
          />
        ))}
      </List.Section>
    </List>
  );
};
