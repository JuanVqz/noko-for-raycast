import { useState } from "react";
import { ProjectType, EntryType, ViewType } from "./types";
import { TimersView, EntriesView, AddEntryView, EditEntryView } from "./views";
import { ErrorBoundary } from "./components";

export default function Command() {
  const [currentView, setCurrentView] = useState<ViewType>("timers");
  const [project, setProject] = useState<ProjectType | null>(null);
  const [editingEntry, setEditingEntry] = useState<EntryType | null>(null);

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

  if (currentView === "edit-entry" && editingEntry) {
    return (
      <ErrorBoundary>
        <EditEntryView
          entry={editingEntry}
          onSubmit={handleEditSuccess}
          onCancel={() => setCurrentView("entries")}
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
          onEditEntry={handleEditEntry}
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
