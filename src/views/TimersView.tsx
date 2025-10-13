import { List } from "@raycast/api";
import { useMemo, useCallback } from "react";
import { ProjectType } from "../types";
import { useProjectsWithTimers } from "../hooks";
import { TimerItem } from "../components/TimerItem";
import { sortProjectsByTimerState } from "../utils";

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
    refreshTimersOnly,
  } = useProjectsWithTimers();

  // Sort projects by timer status for better UX
  const sortedProjects = useMemo(() => {
    return [...projectsWithTimers].sort(sortProjectsByTimerState);
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
