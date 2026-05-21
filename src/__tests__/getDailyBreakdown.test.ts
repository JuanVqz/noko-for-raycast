import { getDailyBreakdown } from "../utils/entry-utils";
import { EntryType } from "../types";

const makeEntry = (
  date: string,
  minutes: number,
  overrides: Partial<EntryType> = {},
): EntryType => ({
  id: date + minutes,
  date,
  billable: true,
  minutes,
  formatted_minutes: "",
  description: "",
  approved_by: null,
  approved_at: "",
  user: {
    id: "u1",
    email: "user@example.com",
    first_name: "Jane",
    last_name: "Doe",
    profile_image_url: "",
  },
  tags: [],
  project: {
    id: "p1",
    name: "Project",
    color: "#ff0000",
    enabled: true,
  },
  ...overrides,
});

describe("getDailyBreakdown", () => {
  it("returns empty array for empty entries", () => {
    expect(getDailyBreakdown([])).toEqual([]);
  });

  it("groups entries by date and sums minutes", () => {
    const entries = [
      makeEntry("2026-05-19", 60),
      makeEntry("2026-05-19", 30),
      makeEntry("2026-05-20", 90),
    ];
    const result = getDailyBreakdown(entries);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2026-05-19");
    expect(result[0].minutes).toBe(90);
    expect(result[1].date).toBe("2026-05-20");
    expect(result[1].minutes).toBe(90);
  });

  it("formats minutes correctly", () => {
    const entries = [makeEntry("2026-05-19", 90)];
    const result = getDailyBreakdown(entries);
    expect(result[0].totalFormatted).toBe("01:30");
  });

  it("includes correct day label for known dates", () => {
    // 2026-05-18 is a Monday
    const entries = [makeEntry("2026-05-18", 60)];
    const result = getDailyBreakdown(entries);
    expect(result[0].dayLabel).toBe("Mon");
  });

  it("sorts rows by date ascending", () => {
    const entries = [
      makeEntry("2026-05-21", 30),
      makeEntry("2026-05-19", 60),
      makeEntry("2026-05-20", 90),
    ];
    const result = getDailyBreakdown(entries);
    expect(result.map((r) => r.date)).toEqual([
      "2026-05-19",
      "2026-05-20",
      "2026-05-21",
    ]);
  });
});
