import { showToast, Toast } from "@raycast/api";
import { startTimer, pauseTimer, stopTimer } from "./useNokoApi";
import { ProjectType, TimerType } from "../types";

export const useTimerControls = (onTimerChange?: () => void) => {
  const handleStartTimer = async (project: ProjectType) => {
    try {
      await startTimer(project.id);
      showToast({
        style: Toast.Style.Success,
        title: "Timer Started",
        message: `Started timer for ${project.name}`,
      });
      onTimerChange?.();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Start Timer",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handlePauseTimer = async (timer: TimerType) => {
    try {
      await pauseTimer(timer.pause_url);
      showToast({
        style: Toast.Style.Success,
        title: "Timer Paused",
        message: `Paused timer for ${timer.project.name}`,
      });
      onTimerChange?.();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Pause Timer",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleStopTimer = async (timer: TimerType) => {
    try {
      await stopTimer(timer.log_url);
      showToast({
        style: Toast.Style.Success,
        title: "Timer Stopped",
        message: `Stopped timer for ${timer.project.name}`,
      });
      // Add a small delay before refreshing to ensure the API has processed the stop
      setTimeout(() => {
        onTimerChange?.();
      }, 100);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Stop Timer",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return {
    handleStartTimer,
    handlePauseTimer,
    handleStopTimer,
  };
};
