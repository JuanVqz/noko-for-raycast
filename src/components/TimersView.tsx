import { List } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { ProjectType, TimerType, TimerStateEnum } from "../types";
import { useProjectsWithTimers, useDetailToggle } from "../hooks";
import { TimerItem } from "./TimerItem";

interface TimersViewProps {
  onNavigateToAddEntry: () => void;
  onNavigateToEntries: () => void;
  onNavigateToLogTimer: (project: ProjectType, timer: TimerType) => void;
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
  } = useProjectsWithTimers();
  const { isShowingDetail, toggleDetail } = useDetailToggle(false);

  // Sort projects by timer status for better UX
  const sortedProjects = useMemo(() => {
    return [...projectsWithTimers].sort((a, b) => {
      const aState = a.timer?.state;
      const bState = b.timer?.state;

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
    refresh();
  }, [refresh]);

  const handleLogTimer = useCallback(
    (project: ProjectType, timer: TimerType) => {
      onNavigateToLogTimer(project, timer);
    },
    [onNavigateToLogTimer],
  );

  if (isLoading) {
    return <List isLoading={true} />;
  }

  return (
    <List isLoading={isLoading} isShowingDetail={isShowingDetail}>
      {sortedProjects.map((project) => (
        <TimerItem
          key={project.id}
          project={project}
          isShowingDetail={isShowingDetail}
          onToggleDetail={toggleDetail}
          onAddEntry={onNavigateToAddEntry}
          onViewEntries={onNavigateToEntries}
          onTimerChange={handleTimerChange}
          onLogTimer={handleLogTimer}
        />
      ))}
    </List>
  );
};
