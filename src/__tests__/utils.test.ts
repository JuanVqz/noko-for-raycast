import {
  formatTime,
  getElapsedTime,
  entryDecorator,
  formattedFilterDate,
  userName,
  formatTags,
  dateOnTimezone,
} from "../utils";
import {
  TimerStateEnum,
  EntryDateEnum,
  EntryType,
  UserType,
  ProjectType,
} from "../types";

// Mock getPreferenceValues
jest.mock("@raycast/api", () => ({
  getPreferenceValues: jest.fn(() => ({
    timezone: "America/New_York",
  })),
}));

describe("utils", () => {
  describe("formatTime", () => {
    it("should format seconds correctly", () => {
      expect(formatTime(3661)).toBe("01:01:01"); // 1 hour, 1 minute, 1 second
      expect(formatTime(65)).toBe("01:05"); // 1 minute, 5 seconds
      expect(formatTime(5)).toBe("00:05"); // 5 seconds
      expect(formatTime(0)).toBe("00:00"); // 0 seconds
      expect(formatTime(3600)).toBe("01:00:00"); // 1 hour exactly
    });

    it("should handle edge cases", () => {
      expect(formatTime(59)).toBe("00:59"); // Just under 1 minute
      expect(formatTime(3599)).toBe("59:59"); // Just under 1 hour
    });
  });

  describe("getElapsedTime", () => {
    const mockTimer = {
      id: "1",
      state: TimerStateEnum.Paused,
      seconds: 3600,
      formatted_time: "01:00:00",
      date: "2024-01-01",
      description: "Test",
      user: {} as UserType,
      project: {} as ProjectType,
      url: "",
      start_url: "",
      pause_url: "",
      add_or_subtract_time_url: "",
      log_url: "",
      log_inbox_entry_url: "",
    };

    it("should return formatted_time for paused timers", () => {
      const result = getElapsedTime(mockTimer, new Date(), new Date());
      expect(result).toBe("01:00:00");
    });

    it("should calculate elapsed time for running timers", () => {
      const runningTimer = {
        ...mockTimer,
        state: TimerStateEnum.Running,
        seconds: 3600,
      };
      const currentTime = new Date("2024-01-01T13:00:00Z");
      const fetchTime = new Date("2024-01-01T12:00:00Z");

      const result = getElapsedTime(runningTimer, currentTime, fetchTime);
      expect(result).toBe("02:00:00"); // 1 hour + 1 hour elapsed
    });

    it("should handle running timer with no time elapsed", () => {
      const runningTimer = {
        ...mockTimer,
        state: TimerStateEnum.Running,
        seconds: 3600,
      };
      const currentTime = new Date("2024-01-01T12:00:00Z");
      const fetchTime = new Date("2024-01-01T12:00:00Z");

      const result = getElapsedTime(runningTimer, currentTime, fetchTime);
      expect(result).toBe("01:00:00"); // No additional time elapsed
    });
  });

  describe("entryDecorator", () => {
    it("should add formatted_minutes to entries", () => {
      const entries: EntryType[] = [
        {
          id: "1",
          date: "2024-01-01",
          billable: true,
          minutes: 90,
          formatted_minutes: "",
          description: "Test entry",
          approved_by: null,
          approved_at: "2024-01-01",
          user: {} as UserType,
          tags: [],
          project: {} as ProjectType,
        },
        {
          id: "2",
          date: "2024-01-01",
          billable: false,
          minutes: 30,
          formatted_minutes: "",
          description: "Another entry",
          approved_by: null,
          approved_at: "2024-01-01",
          user: {} as UserType,
          tags: [],
          project: {} as ProjectType,
        },
      ];

      const result = entryDecorator(entries);

      expect(result[0].formatted_minutes).toBe("01:30");
      expect(result[1].formatted_minutes).toBe("00:30");
      expect(result[0].minutes).toBe(90); // Original minutes should be preserved
      expect(result[1].minutes).toBe(30);
    });

    it("should handle empty entries array", () => {
      const result = entryDecorator([]);
      expect(result).toEqual([]);
    });
  });

  describe("formattedFilterDate", () => {
    beforeEach(() => {
      // Mock Date to return a consistent date
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return today's date for Today filter", () => {
      const result = formattedFilterDate(EntryDateEnum.Today);
      expect(result).toBe("2024-01-15");
    });

    it("should return yesterday's date for Yesterday filter", () => {
      const result = formattedFilterDate(EntryDateEnum.Yesterday);
      expect(result).toBe("2024-01-14");
    });

    it("should return tomorrow's date for Tomorrow filter", () => {
      const result = formattedFilterDate(EntryDateEnum.Tomorrow);
      expect(result).toBe("2024-01-16");
    });
  });

  describe("userName", () => {
    it("should format user name correctly", () => {
      const user: UserType = {
        id: "1",
        email: "john.doe@example.com",
        first_name: "John",
        last_name: "Doe",
        profile_image_url: "",
      };

      const result = userName(user);
      expect(result).toBe("John Doe <john.doe@example.com>");
    });

    it("should return empty string for null user", () => {
      const result = userName(null);
      expect(result).toBe("");
    });

    it("should return empty string for undefined user", () => {
      const result = userName(undefined);
      expect(result).toBe("");
    });

    it("should return empty string for user with missing fields", () => {
      const user = {
        id: "1",
        email: "",
        first_name: "John",
        last_name: "Doe",
        profile_image_url: "",
      } as UserType;

      const result = userName(user);
      expect(result).toBe("");
    });
  });

  describe("formatTags", () => {
    it("should format tags correctly", () => {
      const tags = [
        { formatted_name: "frontend" },
        { formatted_name: "react" },
        { formatted_name: "typescript" },
      ];

      const result = formatTags(tags);
      expect(result).toBe("frontend, react, typescript");
    });

    it("should return empty string for null tags", () => {
      const result = formatTags(null);
      expect(result).toBe("");
    });

    it("should return empty string for undefined tags", () => {
      const result = formatTags(undefined);
      expect(result).toBe("");
    });

    it("should return empty string for empty tags array", () => {
      const result = formatTags([]);
      expect(result).toBe("");
    });

    it("should handle single tag", () => {
      const tags = [{ formatted_name: "frontend" }];
      const result = formatTags(tags);
      expect(result).toBe("frontend");
    });
  });

  describe("dateOnTimezone", () => {
    it("should format date in specified timezone", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = dateOnTimezone(date);
      expect(result).toBe("2024-01-15");
    });

    it("should use default timezone when preference is not set", () => {
      // Mock getPreferenceValues to return no timezone
      jest.doMock("@raycast/api", () => ({
        getPreferenceValues: jest.fn(() => ({})),
      }));

      const date = new Date("2024-01-15T12:00:00Z");
      const result = dateOnTimezone(date);
      expect(result).toBe("2024-01-15");
    });
  });
});
