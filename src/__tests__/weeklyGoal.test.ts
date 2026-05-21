import { getWeeklyGoalProgress } from "../utils/entry-utils";
import { EntryType } from "../types";

const makeEntry = (minutes: number): EntryType => ({
  id: String(minutes),
  date: "2026-05-19",
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
});

describe("getWeeklyGoalProgress", () => {
  it("returns 0% progress with no entries", () => {
    const result = getWeeklyGoalProgress([], 40);
    expect(result.percentage).toBe(0);
    expect(result.met).toBe(false);
  });

  it("calculates correct percentage for partial week", () => {
    const entries = [makeEntry(60 * 20)]; // 20 hours out of 40 goal
    const result = getWeeklyGoalProgress(entries, 40);
    expect(result.percentage).toBe(50);
    expect(result.met).toBe(false);
  });

  it("marks goal as met when total reaches goal", () => {
    const entries = [makeEntry(60 * 40)]; // exactly 40 hours
    const result = getWeeklyGoalProgress(entries, 40);
    expect(result.percentage).toBe(100);
    expect(result.met).toBe(true);
  });

  it("caps percentage at 100 when over goal", () => {
    const entries = [makeEntry(60 * 50)]; // 50 hours, over 40 goal
    const result = getWeeklyGoalProgress(entries, 40);
    expect(result.percentage).toBe(100);
    expect(result.met).toBe(true);
  });

  it("returns formatted logged and goal strings", () => {
    const entries = [makeEntry(90)]; // 1h30m
    const result = getWeeklyGoalProgress(entries, 40);
    expect(result.logged).toBe("01:30");
    expect(result.goal).toBe("40:00");
  });

  it("sums all entries for total minutes", () => {
    const entries = [makeEntry(60), makeEntry(120), makeEntry(60)]; // 4 hours total
    const result = getWeeklyGoalProgress(entries, 8);
    expect(result.percentage).toBe(50);
  });
});
