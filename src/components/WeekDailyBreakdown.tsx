import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  useNavigation,
} from "@raycast/api";
import { DailyBreakdownRowType } from "../types";
import { SUMMARY_COLORS } from "../constants";
import { dateOnTimezone } from "../utils";

interface WeekDailyBreakdownProps {
  rows: DailyBreakdownRowType[];
}

export const WeekDailyBreakdown = ({ rows }: WeekDailyBreakdownProps) => {
  const { pop } = useNavigation();
  const today = dateOnTimezone(new Date());

  return (
    <List navigationTitle="Weekly Breakdown">
      <List.Section title="Daily Breakdown">
        {rows.map((row) => (
          <List.Item
            key={row.date}
            title={`${row.dayLabel} ${row.date}   ${row.totalFormatted}`}
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
            actions={
              <ActionPanel>
                <Action
                  title="Back"
                  icon={Icon.ArrowLeft}
                  onAction={pop}
                  shortcut={{ modifiers: ["cmd"], key: "[" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
};
