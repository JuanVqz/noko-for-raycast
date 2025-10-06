import { getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useMemo, useEffect } from "react";

import { TimerType, TimerStateEnum, IPreferences } from "../types";

type State = {
  filter: TimerStateEnum;
  timers: TimerType[];
};

const useTimers = () => {
  const { personalAccessToken } = getPreferenceValues<IPreferences>();

  const [state, setState] = useState<State>({
    filter: TimerStateEnum.Running,
    timers: [],
  });

  const filteredTimers = useMemo(() => {
    switch (state.filter) {
      case TimerStateEnum.Pending:
        return state.timers.filter(
          (timer) => timer.state === TimerStateEnum.Pending,
        );
      case TimerStateEnum.Paused:
        return state.timers.filter(
          (timer) => timer.state === TimerStateEnum.Paused,
        );
      case TimerStateEnum.Stopped:
        return state.timers.filter(
          (timer) => timer.state === TimerStateEnum.Stopped,
        );
      case TimerStateEnum.Running:
        return state.timers.filter(
          (timer) => timer.state === TimerStateEnum.Running,
        );
      default:
        return state.timers;
    }
  }, [state.filter, state.timers]);

  const { data, isLoading } = useFetch<TimerType[]>(
    `https://api.nokotime.com/v2/timers`,
    {
      headers: {
        "X-NokoToken": personalAccessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    setState({
      filter: state.filter,
      timers: data,
    });
  }, [data]);

  return {
    ...state,
    filteredTimers,
    isLoading,
    setState,
  };
};

export default useTimers;
