import { showToast, Toast } from "@raycast/api";
import { useState, useCallback } from "react";
import { ProjectType, ViewType } from "./types";
import { TimersView, EntriesView, ErrorBoundary } from "./components";
import { AddEntryForm } from "./components/AddEntryForm";

export default function Command() {
  const [currentView, setCurrentView] = useState<ViewType>("timers");
  const [timerToLog, setTimerToLog] = useState<ProjectType | null>(null);

  const handleAddEntry = useCallback(() => {
    setCurrentView("add-entry");
  }, []);

  const handleViewEntries = useCallback(() => {
    setCurrentView("entries");
  }, []);

  const handleBackToTimers = useCallback(() => {
    setCurrentView("timers");
    setTimerToLog(null);
  }, []);

  const handleLogTimer = useCallback(
    (project: ProjectType) => {
      setTimerToLog(project);
      setCurrentView("add-entry");
    },
    [],
  );

  const handleEntrySuccess = useCallback(() => {
    showToast({
      style: Toast.Style.Success,
      title: "Entry Added",
      message: "Time entry has been added successfully",
    });
    setCurrentView("timers");
    setTimerToLog(null);
  }, []);

  const handleEntryCancel = useCallback(() => {
    setCurrentView("timers");
    setTimerToLog(null);
  }, []);

  // Render different views based on current state
  if (currentView === "add-entry") {
    return (
      <ErrorBoundary>
        <AddEntryForm
          timerToLog={timerToLog || undefined}
          onSubmit={handleEntrySuccess}
          onCancel={handleEntryCancel}
        />
      </ErrorBoundary>
    );
  }

  if (currentView === "entries") {
    return (
      <ErrorBoundary>
        <EntriesView onClose={handleBackToTimers} />
      </ErrorBoundary>
    );
  }

  // Default view: timers list
  return (
    <ErrorBoundary>
      <TimersView
        onNavigateToAddEntry={handleAddEntry}
        onNavigateToEntries={handleViewEntries}
        onNavigateToLogTimer={handleLogTimer}
      />
    </ErrorBoundary>
  );
}
