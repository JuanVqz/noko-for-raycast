import { TimerStateEnum } from "../types";
import { TIMER_STATE_PRIORITIES } from "../constants";

export const getTimerStatePriority = (state: TimerStateEnum | null): number => {
  if (state === TimerStateEnum.Running) return TIMER_STATE_PRIORITIES.RUNNING;
  if (state === TimerStateEnum.Paused) return TIMER_STATE_PRIORITIES.PAUSED;
  return TIMER_STATE_PRIORITIES.NULL;
};
