import { useState } from "react";
import { ProjectType, EntryType, ViewType } from "./types";
import { TimersView, EntriesView, AddEntryView, EditEntryView } from "./views";
import { ErrorBoundary } from "./components";

export default function Command() {
  const [currentView, setCurrentView] = useState<ViewType>("timers");
  const [project, setProject] = useState<ProjectType | null>(null);
  // Distinguishes "log a running timer" (use elapsed time + logTimer endpoint)
  // from "preselect a project for a fresh entry" (default time + submitEntry).
  const [hasRunningTimer, setHasRunningTimer] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryType | null>(null);

  const handleAddEntryForProject = (projectToPreset: ProjectType) => {
    setProject(projectToPreset);
    setHasRunningTimer(false);
    setCurrentView("add-entry");
  };

  const handleViewEntries = () => {
    setCurrentView("entries");
  };

  const handleBackToTimers = () => {
    setCurrentView("timers");
    setProject(null);
    setHasRunningTimer(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: EntryType) => {
    setEditingEntry(entry);
    setCurrentView("edit-entry");
  };

  const handleEditSuccess = () => {
    setCurrentView("entries");
    setEditingEntry(null);
  };

  const handleCancelEdit = () => {
    setCurrentView("entries");
  };

  const handleLogTimer = (projectToLog: ProjectType) => {
    setProject(projectToLog);
    setHasRunningTimer(true);
    setCurrentView("add-entry");
  };

  const handleEntrySuccess = () => {
    setCurrentView("timers");
    setProject(null);
    setHasRunningTimer(false);
  };

  if (currentView === "add-entry" && project) {
    return (
      <ErrorBoundary>
        <AddEntryView
          project={project}
          hasRunningTimer={hasRunningTimer}
          onSubmit={handleEntrySuccess}
          onCancel={handleBackToTimers}
        />
      </ErrorBoundary>
    );
  }

  if (currentView === "edit-entry" && editingEntry) {
    return (
      <ErrorBoundary>
        <EditEntryView
          entry={editingEntry}
          onSubmit={handleEditSuccess}
          onCancel={handleCancelEdit}
        />
      </ErrorBoundary>
    );
  }

  if (currentView === "entries") {
    return (
      <ErrorBoundary>
        <EntriesView
          onCancel={handleBackToTimers}
          onEditEntry={handleEditEntry}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <TimersView
        onNavigateToAddEntryForProject={handleAddEntryForProject}
        onNavigateToEntries={handleViewEntries}
        onNavigateToLogTimer={handleLogTimer}
      />
    </ErrorBoundary>
  );
}
