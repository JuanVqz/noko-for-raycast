import { useState } from "react";
import { ProjectType, ViewType } from "./types";
import { TimersView, EntriesView, AddEntryView } from "./views";
import { ErrorBoundary } from "./components";

export default function Command() {
  const [currentView, setCurrentView] = useState<ViewType>("timers");
  const [project, setProject] = useState<ProjectType | null>(null);

  const handleAddEntry = () => {
    setProject(null);
    setCurrentView("add-entry");
  };

  const handleViewEntries = () => {
    setCurrentView("entries");
  };

  const handleBackToTimers = () => {
    setCurrentView("timers");
    setProject(null);
  };

  const handleLogTimer = (projectToLog: ProjectType) => {
    setProject(projectToLog);
    setCurrentView("add-entry");
  };

  const handleEntrySuccess = () => {
    setCurrentView("timers");
    setProject(null);
  };

  if (currentView === "add-entry") {
    return (
      <ErrorBoundary>
        <AddEntryView
          project={project}
          onSubmit={handleEntrySuccess}
          onCancel={handleBackToTimers}
        />
      </ErrorBoundary>
    );
  }

  if (currentView === "entries") {
    return (
      <ErrorBoundary>
        <EntriesView
          onCancel={handleBackToTimers}
          onAddEntry={handleAddEntry}
        />
      </ErrorBoundary>
    );
  }

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
