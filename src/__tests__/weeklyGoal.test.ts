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
    billable: true,
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

  it("returns 0% progress when goalHours is 0", () => {
    const entries = [makeEntry(60 * 20)];
    const result = getWeeklyGoalProgress(entries, 0);
    expect(result.percentage).toBe(0);
    expect(result.met).toBe(true); // 0 goal means any logged time meets it
  });

  describe("pace status", () => {
    it("is met when the whole goal is reached", () => {
      const result = getWeeklyGoalProgress([makeEntry(60 * 40)], 40, 3);
      expect(result.status).toBe("met");
    });

    it("is on-track when logged meets the expected pace so far", () => {
      // Wed (3 of 5 weekdays) of a 40h goal expects 24h; logged 24h.
      const result = getWeeklyGoalProgress([makeEntry(60 * 24)], 40, 3);
      expect(result.status).toBe("on-track");
    });

    it("is behind when logged is under pace but within 75%", () => {
      // Wed expects 24h; 20h is 83% of expected → behind.
      const result = getWeeklyGoalProgress([makeEntry(60 * 20)], 40, 3);
      expect(result.status).toBe("behind");
    });

    it("is at-risk when far under the expected pace", () => {
      // Mon expects 8h; only 2h logged → at risk.
      const result = getWeeklyGoalProgress([makeEntry(60 * 2)], 40, 1);
      expect(result.status).toBe("at-risk");
    });

    it("is on-track on Sunday before any working day elapses", () => {
      const result = getWeeklyGoalProgress([], 40, 0);
      expect(result.status).toBe("on-track");
    });
  });
});
