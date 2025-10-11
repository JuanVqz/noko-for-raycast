import { List } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { ProjectType, TimerType, TimerStateEnum } from "../types";
import { useProjectsWithTimers } from "../hooks";
import { TimerItem } from "./TimerItem";
import { isTimerNull } from "../utils";

interface TimersViewProps {
  onNavigateToAddEntry: () => void;
  onNavigateToEntries: () => void;
  onNavigateToLogTimer: (project: ProjectType) => void;
}

export const TimersView = ({
  onNavigateToAddEntry,
  onNavigateToEntries,
  onNavigateToLogTimer,
}: TimersViewProps) => {
  const {
    data: projectsWithTimers,
    isLoading,
    refresh,
    refreshTimersOnly,
  } = useProjectsWithTimers();

  // Sort projects by timer status for better UX
  const sortedProjects = useMemo(() => {
    return [...projectsWithTimers].sort((a, b) => {
      const aState = isTimerNull(a.timer) ? null : a.timer.state;
      const bState = isTimerNull(b.timer) ? null : b.timer.state;

      // Running timers first
      if (
        aState === TimerStateEnum.Running &&
        bState !== TimerStateEnum.Running
      )
        return -1;
      if (
        bState === TimerStateEnum.Running &&
        aState !== TimerStateEnum.Running
      )
        return 1;

      // Paused timers second
      if (
        aState === TimerStateEnum.Paused &&
        bState !== TimerStateEnum.Paused &&
        bState !== TimerStateEnum.Running
      )
        return -1;
      if (
        bState === TimerStateEnum.Paused &&
        aState !== TimerStateEnum.Paused &&
        aState !== TimerStateEnum.Running
      )
        return 1;

      // Alphabetical for same status
      return a.name.localeCompare(b.name);
    });
  }, [projectsWithTimers]);

  const handleTimerChange = useCallback(() => {
    // Only refresh timers data to update the elapsed time
    refreshTimersOnly();
  }, [refreshTimersOnly]);

  const handleLogTimer = useCallback(
    (project: ProjectType) => {
      onNavigateToLogTimer(project);
    },
    [onNavigateToLogTimer],
  );

  if (isLoading) {
    return <List isLoading={true} />;
  }

  return (
    <List isLoading={isLoading}>
      {sortedProjects.map((project) => (
        <TimerItem
          key={project.id}
          project={project}
          onAddEntry={onNavigateToAddEntry}
          onViewEntries={onNavigateToEntries}
          onLogTimer={handleLogTimer}
          onTimerChange={handleTimerChange}
        />
      ))}
    </List>
  );
};
