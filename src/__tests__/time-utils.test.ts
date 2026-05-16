import {
  hoursFormat,
  formatMinutesAsTime,
  parseTimeInput,
  convertElapsedTimeToMinutes,
} from "../utils/time-utils";

describe("hoursFormat", () => {
  it("pads both hours and minutes", () => {
    expect(hoursFormat(90)).toBe("01:30");
    expect(hoursFormat(0)).toBe("00:00");
    expect(hoursFormat(60)).toBe("01:00");
  });

  it("handles large values", () => {
    expect(hoursFormat(1440)).toBe("24:00");
    expect(hoursFormat(2400)).toBe("40:00");
  });
});

describe("formatMinutesAsTime", () => {
  it("formats without leading zero on hours", () => {
    expect(formatMinutesAsTime(90)).toBe("1:30");
    expect(formatMinutesAsTime(0)).toBe("0:00");
    expect(formatMinutesAsTime(60)).toBe("1:00");
    expect(formatMinutesAsTime(15)).toBe("0:15");
  });

  it("pads minutes but not hours", () => {
    expect(formatMinutesAsTime(9)).toBe("0:09");
    expect(formatMinutesAsTime(125)).toBe("2:05");
  });
});

describe("parseTimeInput", () => {
  it("parses h:mm format", () => {
    expect(parseTimeInput("1:30")).toBe(90);
    expect(parseTimeInput("0:15")).toBe(15);
    expect(parseTimeInput("2:00")).toBe(120);
  });

  it("parses plain minutes", () => {
    expect(parseTimeInput("90")).toBe(90);
    expect(parseTimeInput("15")).toBe(15);
    expect(parseTimeInput("0")).toBe(0);
  });

  it("parses decimal minutes", () => {
    expect(parseTimeInput("1.5")).toBe(1.5);
  });

  it("trims whitespace", () => {
    expect(parseTimeInput("  1:30  ")).toBe(90);
    expect(parseTimeInput("  60  ")).toBe(60);
  });

  it("throws on empty input", () => {
    expect(() => parseTimeInput("")).toThrow("Time is required");
    expect(() => parseTimeInput("   ")).toThrow("Time is required");
  });

  it("throws on invalid h:mm format", () => {
    expect(() => parseTimeInput("abc:30")).toThrow("Invalid time format");
    expect(() => parseTimeInput("1:70")).toThrow("Invalid time format");
    expect(() => parseTimeInput("1:ab")).toThrow("Invalid time format");
  });

  it("throws on invalid plain value", () => {
    expect(() => parseTimeInput("abc")).toThrow("Invalid time format");
  });
});

describe("convertElapsedTimeToMinutes", () => {
  it("converts h:mm:ss format", () => {
    expect(convertElapsedTimeToMinutes("1:30:00")).toBe(90);
    expect(convertElapsedTimeToMinutes("0:00:00")).toBe(0);
    expect(convertElapsedTimeToMinutes("2:00:30")).toBe(121); // 30s rounds to 1m
  });

  it("converts mm:ss format", () => {
    expect(convertElapsedTimeToMinutes("90:00")).toBe(90);
    expect(convertElapsedTimeToMinutes("0:30")).toBe(1); // 30s rounds to 1m
    expect(convertElapsedTimeToMinutes("0:00")).toBe(0);
  });

  it("returns 0 for unrecognised format", () => {
    expect(convertElapsedTimeToMinutes("invalid")).toBe(0);
  });

  it("rounds seconds to nearest minute", () => {
    expect(convertElapsedTimeToMinutes("1:00:29")).toBe(60); // 29s rounds down
    expect(convertElapsedTimeToMinutes("1:00:30")).toBe(61); // 30s rounds up
  });
});
