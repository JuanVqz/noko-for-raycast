import { List, Icon } from "@raycast/api";
import { DailyBreakdownRowType } from "../types";
import { SUMMARY_COLORS } from "../constants";

interface WeekDailyBreakdownProps {
  rows: DailyBreakdownRowType[];
}

export const WeekDailyBreakdown = ({ rows }: WeekDailyBreakdownProps) => {
  return (
    <List navigationTitle="Weekly Breakdown">
      <List.Section title="Daily Breakdown">
        {rows.map((row) => (
          <List.Item
            key={row.date}
            title={`${row.dayLabel} ${row.date}   ${row.totalFormatted}`}
            icon={Icon.Calendar}
            accessories={[
              {
                icon: { source: Icon.Coins, tintColor: SUMMARY_COLORS.BILLABLE },
                text: row.billable,
              },
              {
                icon: { source: Icon.Coins, tintColor: SUMMARY_COLORS.UNBILLABLE },
                text: row.unbillable,
              },
            ]}
          />
        ))}
      </List.Section>
    </List>
  );
};
