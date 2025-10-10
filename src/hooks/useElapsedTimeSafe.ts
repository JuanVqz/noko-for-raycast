import { useState, useEffect, useMemo, useRef } from "react";
import { TimerType, TimerStateEnum } from "../types";
import { getElapsedTime } from "../utils";

const useElapsedTimeSafe = (timer: TimerType | null) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const fetchTimeRef = useRef(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!timer) {
      return;
    }

    // Update fetch time when timer changes
    fetchTimeRef.current = new Date();

    if (timer.state === TimerStateEnum.Running) {
      // For running timers, update immediately and then every second
      setCurrentTime(new Date());
      intervalRef.current = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    // For paused timers, don't update currentTime - getElapsedTime will return timer.formatted_time

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer?.state, timer?.id]); // Include timer.id to reset when timer changes

  const elapsedTime = useMemo(() => {
    if (!timer) {
      return null;
    }
    return getElapsedTime(timer, currentTime, fetchTimeRef.current);
  }, [
    timer?.id,
    timer?.state,
    timer?.state === TimerStateEnum.Running ? currentTime : timer?.formatted_time
  ]);

  return elapsedTime;
};

export default useElapsedTimeSafe;
