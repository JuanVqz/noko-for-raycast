import { List } from "@raycast/api";
import { useMemo } from "react";
import { ProjectType } from "../types";
import { useProjects, useTimers, useRecentEntries } from "../hooks";
import { TimerItem } from "../components/TimerItem";
import { ProjectItem } from "../components/ProjectItem";

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
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: recentEntries = [] } = useRecentEntries(30);

  const {
    data: timers = [],
    isLoading: timersLoading,
    mutate: refreshTimers,
  } = useTimers();

  const isLoading = projectsLoading || timersLoading;

  const latestUsedByProject = useMemo(() => {
    const map: Record<string, string> = {};
    for (const entry of recentEntries) {
      const current = map[entry.project.id];
      if (!current || entry.date > current) {
        map[entry.project.id] = entry.date;
      }
    }
    return map;
  }, [recentEntries]);

  const projectsWithoutTimers = useMemo(() => {
    const projectIdsWithTimers = new Set(
      timers.map((timer) => timer.project.id),
    );
    const filtered = projects.filter(
      (project) => !projectIdsWithTimers.has(project.id),
    );
    return [...filtered].sort((a, b) => {
      const dateA = latestUsedByProject[a.id] ?? "";
      const dateB = latestUsedByProject[b.id] ?? "";
      if (dateA === dateB) return a.name.localeCompare(b.name);
      return dateB.localeCompare(dateA);
    });
  }, [projects, timers, latestUsedByProject]);

  return (
    <List isLoading={isLoading}>
      {timers.map((timer) => (
        <TimerItem
          key={timer.id}
          timer={timer}
          onAddEntry={onNavigateToAddEntry}
          onViewEntries={onNavigateToEntries}
          onLogTimer={onNavigateToLogTimer}
          onTimerChange={refreshTimers}
        />
      ))}

      {projectsWithoutTimers.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          onAddEntry={onNavigateToAddEntry}
          onViewEntries={onNavigateToEntries}
          onTimerChange={refreshTimers}
        />
      ))}
    </List>
  );
};
