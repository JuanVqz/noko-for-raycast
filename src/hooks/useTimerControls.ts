import { showToast, Toast } from "@raycast/api";
import { startTimer, pauseTimer, stopTimer, discardTimer } from "./useNokoApi";
import { ProjectType, TimerType } from "../types";

export const useTimerControls = (
  onTimerChange?: () => void,
  onLogTimer?: (project: ProjectType, timer: TimerType) => void,
) => {
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

  const handleLogTimer = (project: ProjectType, timer: TimerType) => {
    onLogTimer?.(project, timer);
  };

  const handleDiscardTimer = async (project: ProjectType) => {
    try {
      await discardTimer(project.id);
      showToast({
        style: Toast.Style.Success,
        title: "Timer Discarded",
        message: `Timer discarded for ${project.name} (time not saved)`,
      });
      // Add a small delay before refreshing to ensure the API has processed the discard
      setTimeout(() => {
        onTimerChange?.();
      }, 100);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Discard Timer",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return {
    handleStartTimer,
    handlePauseTimer,
    handleLogTimer,
    handleDiscardTimer,
  };
};
