import { useState, useEffect, useMemo } from "react";
import { TimerType, TimerStateEnum } from "../types";
import { getElapsedTime } from "../utils";

const useElapsedTime = (timer: TimerType) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fetchTime] = useState(new Date());

  useEffect(() => {
    if (timer.state !== TimerStateEnum.Running) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.state]);

  const elapsedTime = useMemo(() => {
    return getElapsedTime(timer, currentTime, fetchTime);
  }, [timer, currentTime, fetchTime]);

  return elapsedTime;
};

export default useElapsedTime;
