import { getEntriesSummary } from "../utils";
import { EntryType, UserType, ProjectType } from "../types";

const createMockEntry = (
  id: string,
  minutes: number,
  billable: boolean,
  description: string = "Test entry",
): EntryType => ({
  id,
  date: "2024-01-01",
  billable,
  minutes,
  formatted_minutes: "",
  description,
  approved_by: null,
  approved_at: "2024-01-01",
  user: {} as UserType,
  tags: [],
  project: {} as ProjectType,
});

describe("getEntriesSummary", () => {
  it("should generate summary with all fields", () => {
    const entries: EntryType[] = [
      createMockEntry("1", 90, true, "Billable work"),
      createMockEntry("2", 60, false, "Non-billable work"),
    ];

    const result = getEntriesSummary(entries);

    expect(result.title).toBe(
      "Total 02:30 • Billable 01:30 • Unbillable 01:00",
    );
    expect(result.subtitle).toBe("2 entries • 60% billable");
    expect(result.exists).toBe(true);
    expect(result.billable).toBe("01:30");
    expect(result.unbillable).toBe("01:00");
  });

  it("should return exists: false for empty entries", () => {
    const result = getEntriesSummary([]);

    expect(result.exists).toBe(false);
  });

  it("should calculate billable percentage correctly", () => {
    const entries: EntryType[] = [
      createMockEntry("1", 100, true, "Billable 1"),
      createMockEntry("2", 100, true, "Billable 2"),
      createMockEntry("3", 100, false, "Unbillable"),
    ];

    const result = getEntriesSummary(entries);

    expect(result.subtitle).toContain("67% billable");
  });

  it("should handle 0% billable", () => {
    const entries: EntryType[] = [
      createMockEntry("1", 60, false, "Unbillable work"),
    ];

    const result = getEntriesSummary(entries);

    expect(result.subtitle).toBe("1 entry • 0% billable");
  });

  it("should handle 100% billable", () => {
    const entries: EntryType[] = [
      createMockEntry("1", 120, true, "Billable work"),
    ];

    const result = getEntriesSummary(entries);

    expect(result.subtitle).toBe("1 entry • 100% billable");
  });

  it("should use singular 'entry' for single entry", () => {
    const entries: EntryType[] = [
      createMockEntry("1", 60, true, "Single entry"),
    ];

    const result = getEntriesSummary(entries);

    expect(result.subtitle).toBe("1 entry • 100% billable");
  });

  it("should use plural 'entries' for multiple entries", () => {
    const entries: EntryType[] = [
      createMockEntry("1", 60, true, "Entry 1"),
      createMockEntry("2", 60, true, "Entry 2"),
    ];

    const result = getEntriesSummary(entries);

    expect(result.subtitle).toBe("2 entries • 100% billable");
  });
});
