import { useState, useEffect, useMemo, useRef } from "react";
import { TimerType, TimerStateEnum } from "../types";
import { getElapsedTime } from "../utils";

const useElapsedTime = (timer: TimerType) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const fetchTimeRef = useRef(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timer.state !== TimerStateEnum.Running) {
      return;
    }

    // Update fetch time when timer changes
    fetchTimeRef.current = new Date();

    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.state, timer.id]); // Include timer.id to reset when timer changes

  const elapsedTime = useMemo(() => {
    return getElapsedTime(timer, currentTime, fetchTimeRef.current);
  }, [timer, currentTime]);

  return elapsedTime;
};

export default useElapsedTime;
