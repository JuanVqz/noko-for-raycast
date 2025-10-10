import { useState, useEffect, useMemo, useRef } from "react";
import { TimerType, TimerStateEnum } from "../types";

interface UseElapsedTimeOptions {
  updateInterval?: number;
}

export const useElapsedTime = (
  timer: TimerType | null,
  options: UseElapsedTimeOptions = {},
) => {
  const { updateInterval = 1000 } = options;
  const [currentTime, setCurrentTime] = useState(new Date());
  const fetchTimeRef = useRef<Date>(new Date());

  // Update current time for running timers
  useEffect(() => {
    if (!timer || timer.state !== TimerStateEnum.Running) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [timer?.id, timer?.state, updateInterval]);

  // Update fetch time when timer changes
  useEffect(() => {
    if (timer) {
      fetchTimeRef.current = new Date();
    }
  }, [timer?.id]);

  const elapsedTime = useMemo(() => {
    if (!timer) {
      return null;
    }

    if (timer.state === TimerStateEnum.Running) {
      const elapsed = Math.floor(
        (currentTime.getTime() - fetchTimeRef.current.getTime()) / 1000,
      );
      const totalSeconds = timer.seconds + elapsed;
      return formatTime(totalSeconds);
    }

    // For paused timers, return the stored formatted time
    return timer.formatted_time;
  }, [timer, currentTime]);

  return elapsedTime;
};

// Utility function to format seconds into HH:MM:SS
function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
