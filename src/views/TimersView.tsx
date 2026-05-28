import { List } from "@raycast/api";
import { useMemo, useState, useCallback } from "react";
import { ProjectType } from "../types";
import { buildWeekMinutesByProject } from "../utils/project-utils";
import {
  useProjects,
  useTimers,
  useRecentEntries,
  useWeekEntries,
} from "../hooks";
import {
  buildLatestUsedByProject,
  sortProjectsByLatestUsed,
} from "../utils/project-utils";
import { TimerItem } from "../components/TimerItem";
import { ProjectItem } from "../components/ProjectItem";

type ProjectFilter = "active" | "archived" | "all";

interface TimersViewProps {
  onNavigateToAddEntry: () => void;
  onNavigateToAddEntryForProject: (project: ProjectType) => void;
  onNavigateToEntries: () => void;
  onNavigateToLogTimer: (project: ProjectType) => void;
}

export const TimersView = ({
  onNavigateToAddEntry,
  onNavigateToAddEntryForProject,
  onNavigateToEntries,
  onNavigateToLogTimer,
}: TimersViewProps) => {
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("active");

  const { data: projects = [], isLoading: projectsLoading } =
    useProjects(projectFilter);
  const { data: recentEntries = [], isLoading: recentEntriesLoading } =
    useRecentEntries(30);
  const { data: weekEntries = [] } = useWeekEntries();

  const {
    data: timers = [],
    isLoading: timersLoading,
    mutate: refreshTimers,
  } = useTimers();

  const isLoading = projectsLoading || timersLoading || recentEntriesLoading;

  const latestUsedByProject = useMemo(
    () => buildLatestUsedByProject(recentEntries),
    [recentEntries],
  );

  const weekMinutesByProject = useMemo(
    () => buildWeekMinutesByProject(weekEntries),
    [weekEntries],
  );

  const projectsWithoutTimers = useMemo(() => {
    const projectIdsWithTimers = new Set(
      timers.map((timer) => timer.project.id),
    );
    const filtered = projects.filter(
      (project) => !projectIdsWithTimers.has(project.id),
    );
    return sortProjectsByLatestUsed(filtered, latestUsedByProject);
  }, [projects, timers, latestUsedByProject]);

  const handleFilterChange = useCallback((value: string) => {
    setProjectFilter(value as ProjectFilter);
  }, []);

  return (
    <List
      isLoading={isLoading}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter Projects"
          value={projectFilter}
          onChange={handleFilterChange}
        >
          <List.Dropdown.Item title="Active" value="active" />
          <List.Dropdown.Item title="Archived" value="archived" />
          <List.Dropdown.Item title="All" value="all" />
        </List.Dropdown>
      }
    >
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
          weekMinutes={weekMinutesByProject[project.id] ?? 0}
          onAddEntry={onNavigateToAddEntryForProject}
          onViewEntries={onNavigateToEntries}
          onTimerChange={refreshTimers}
        />
      ))}
    </List>
  );
};
