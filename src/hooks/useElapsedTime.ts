import { useState, useEffect, useRef } from "react";
import { TimerType, TimerNullType, TimerStateEnum } from "../types";
import { getElapsedTime } from "../utils";

const useElapsedTime = (timer: TimerType | TimerNullType) => {
  const [elapsedTime, setElapsedTime] = useState<string>("0:00:00");
  const fetchTimeRef = useRef(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastElapsedTimeRef = useRef<string | null>(null);

  useEffect(() => {
    // Early return for null timers to avoid unnecessary interval setup
    if (timer.id === "") {
      setElapsedTime("0:00:00");
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Update fetch time when timer changes or state changes
    fetchTimeRef.current = new Date();

    // Calculate initial elapsed time
    const initialElapsedTime = getElapsedTime(
      timer,
      new Date(),
      fetchTimeRef.current,
    );
    setElapsedTime(initialElapsedTime);
    lastElapsedTimeRef.current = initialElapsedTime;

    if (timer.state === TimerStateEnum.Running) {
      // For running timers, update every second but only if the displayed time changes
      intervalRef.current = setInterval(() => {
        const newElapsedTime = getElapsedTime(
          timer,
          new Date(),
          fetchTimeRef.current,
        );

        // Only update state if the elapsed time actually changed
        if (newElapsedTime !== lastElapsedTimeRef.current) {
          setElapsedTime(newElapsedTime);
          lastElapsedTimeRef.current = newElapsedTime;
        }
      }, 1000);
    }
    // For paused/stopped timers, don't set up interval - elapsedTime stays as initial value

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.state, timer.id]); // Include timer.id to reset when timer changes

  return elapsedTime;
};

export default useElapsedTime;
