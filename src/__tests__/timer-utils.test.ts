import { getTimerStatePriority } from "../utils/timer-utils";
import { TimerStateEnum } from "../types";
import { TIMER_STATE_PRIORITIES } from "../constants";

describe("getTimerStatePriority", () => {
  it("returns RUNNING priority for running state", () => {
    expect(getTimerStatePriority(TimerStateEnum.Running)).toBe(TIMER_STATE_PRIORITIES.RUNNING);
  });

  it("returns PAUSED priority for paused state", () => {
    expect(getTimerStatePriority(TimerStateEnum.Paused)).toBe(TIMER_STATE_PRIORITIES.PAUSED);
  });

  it("returns NULL priority for null state", () => {
    expect(getTimerStatePriority(null)).toBe(TIMER_STATE_PRIORITIES.NULL);
  });

  it("running sorts before paused", () => {
    expect(getTimerStatePriority(TimerStateEnum.Running)).toBeLessThan(
      getTimerStatePriority(TimerStateEnum.Paused),
    );
  });

  it("paused sorts before null", () => {
    expect(getTimerStatePriority(TimerStateEnum.Paused)).toBeLessThan(
      getTimerStatePriority(null),
    );
  });
});
