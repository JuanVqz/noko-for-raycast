import {
  List,
  showToast,
  Toast,
  LaunchProps,
} from "@raycast/api";
import { useMemo, useState } from "react";
import { ProjectType, TimerType } from "./types";
import { useProjects, useDetailToggle } from "./hooks";
import { useTimers as useTimersApi } from "./hooks/useNokoApi";
import { TimerItem, AddEntryForm, EntriesList } from "./components";

type ViewType = "timers" | "add-entry" | "entries";

interface TimersCommandProps {
  launchContext?: LaunchProps["launchContext"];
}

export default function Command({ launchContext }: TimersCommandProps) {
  const [currentView, setCurrentView] = useState<ViewType>("timers");
  const [timerToLog, setTimerToLog] = useState<{
    project: ProjectType;
    timer: TimerType;
  } | null>(null);
  const {
    data: projects = [],
    isLoading: projectsLoading,
    mutate: mutateProjects,
  } = useProjects();
  const {
    data: timers = [],
    isLoading: timersLoading,
    mutate: mutateTimers,
  } = useTimersApi();
  const { isShowingDetail, toggleDetail } = useDetailToggle(false);

  const isLoading = projectsLoading || timersLoading;

  // Create a map of project ID to timer for quick lookup
  const timerMap = useMemo(() => {
    const map = new Map<string, TimerType>();
    timers.forEach((timer: TimerType) => {
      map.set(timer.project.id, timer);
    });
    return map;
  }, [timers]);

  // Combine projects with their timer states and sort by timer status
  const timersWithProjects: ProjectType[] = useMemo(() => {
    const projectsWithTimerData = projects.map((project) => ({
      ...project,
      timer: timerMap.get(project.id),
    }));

    // Sort timers: Running timers first, then Paused timers, then no timers
    return projectsWithTimerData.sort((a, b) => {
      const aState = a.timer?.state;
      const bState = b.timer?.state;

      // Running timers first
      if (aState === "running" && bState !== "running") return -1;
      if (bState === "running" && aState !== "running") return 1;

      // Paused timers second
      if (aState === "paused" && bState !== "paused" && bState !== "running")
        return -1;
      if (bState === "paused" && aState !== "paused" && aState !== "running")
        return 1;

      // For projects with the same timer state, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [projects, timerMap]);

  const handleAddEntry = () => {
    setCurrentView("add-entry");
  };

  const handleViewEntries = () => {
    setCurrentView("entries");
  };

  const handleBackToTimers = () => {
    setCurrentView("timers");
  };

  const handleTimerChange = () => {
    // Refresh both projects and timers data
    mutateProjects();
    mutateTimers();
  };

  const handleLogTimer = (project: ProjectType, timer: TimerType) => {
    setTimerToLog({ project, timer });
    setCurrentView("add-entry");
  };

  // Render different views based on current state
  if (currentView === "add-entry") {
    return (
      <AddEntryForm
        timerToLog={timerToLog || undefined}
        onSubmit={() => {
          showToast({
            style: Toast.Style.Success,
            title: "Entry Added",
            message: "Time entry has been added successfully",
          });
          setCurrentView("timers");
          setTimerToLog(null); // Clear the timer data
        }}
        onCancel={() => {
          setCurrentView("timers");
          setTimerToLog(null); // Clear the timer data
        }}
      />
    );
  }

  if (currentView === "entries") {
    return <EntriesList onClose={handleBackToTimers} />;
  }

  // Default view: timers list
  return (
    <List isLoading={isLoading} isShowingDetail={isShowingDetail}>
      {timersWithProjects.map((project) => (
        <TimerItem
          key={project.id}
          project={project}
          isShowingDetail={isShowingDetail}
          onToggleDetail={toggleDetail}
          onAddEntry={handleAddEntry}
          onViewEntries={handleViewEntries}
          onTimerChange={handleTimerChange}
          onLogTimer={handleLogTimer}
        />
      ))}
    </List>
  );
}
