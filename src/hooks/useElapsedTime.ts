import { useState, useEffect, useRef } from "react";
import { TimerType, TimerStateEnum } from "../types";
import {
  getElapsedTime,
  playSystemSound,
  convertElapsedTimeToMinutes,
} from "../utils";
import { getPreferenceValues } from "@raycast/api";

const useElapsedTime = (timer: TimerType) => {
  const [elapsedTime, setElapsedTime] = useState<string>("0:00:00");
  const fetchTimeRef = useRef(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastElapsedTimeRef = useRef<string | null>(null);
  const lastSoundNotificationRef = useRef<number>(0);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Update fetch time when timer changes or state changes
    fetchTimeRef.current = new Date();

    // Reset sound notification tracking when timer changes or state changes
    lastSoundNotificationRef.current = 0;

    // Calculate initial elapsed time
    const initialElapsedTime = getElapsedTime(
      timer,
      new Date(),
      fetchTimeRef.current,
    );
    setElapsedTime(initialElapsedTime);
    lastElapsedTimeRef.current = initialElapsedTime;

    if (timer.state === TimerStateEnum.Running) {
      // For running timers, update every second
      intervalRef.current = setInterval(() => {
        const newElapsedTime = getElapsedTime(
          timer,
          new Date(),
          fetchTimeRef.current,
        );

        setElapsedTime(newElapsedTime);
        lastElapsedTimeRef.current = newElapsedTime;

        // Check if we should play a sound notification
        const currentElapsedMinutes =
          convertElapsedTimeToMinutes(newElapsedTime);

        // Get user preferences for sound
        const preferences = getPreferenceValues();
        const soundInterval = parseInt(preferences.soundInterval, 10) || 15; // Default to 15 minutes

        // Play sound every time increment (e.g., every 15 minutes)
        if (
          Number.isFinite(soundInterval) &&
          currentElapsedMinutes > 0 &&
          currentElapsedMinutes % soundInterval === 0 &&
          currentElapsedMinutes !== lastSoundNotificationRef.current
        ) {
          const soundType = preferences.soundNotification || "glass";
          const volume = preferences.soundVolume;

          // Only play sound if it's not set to 'none'
          if (soundType !== "none") {
            playSystemSound(soundType, volume);
          }
          lastSoundNotificationRef.current = currentElapsedMinutes;
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
