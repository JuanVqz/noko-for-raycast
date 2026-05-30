import { useState } from "react";
import { ProjectType, EntryType, EntryDraft } from "./types";
import { TimersView, EntriesView, AddEntryView, EditEntryView } from "./views";
import { ErrorBoundary } from "./components";

// Single source of truth for routing + per-screen payload. Encoding the
// payload alongside the screen name makes invalid combinations (e.g.
// "edit-entry" without an entry, "add-entry" without a draft) impossible.
type Screen =
  | { name: "timers" }
  | { name: "entries" }
  | { name: "add-entry"; draft: EntryDraft }
  | { name: "edit-entry"; entry: EntryType };

const TIMERS_SCREEN: Screen = { name: "timers" };

export default function Command() {
  const [screen, setScreen] = useState<Screen>(TIMERS_SCREEN);

  const openManualEntry = (project: ProjectType) =>
    setScreen({ name: "add-entry", draft: { mode: "manual", project } });

  const openTimerLog = (project: ProjectType) =>
    setScreen({ name: "add-entry", draft: { mode: "log-timer", project } });

  const openEntries = () => setScreen({ name: "entries" });

  const openEditEntry = (entry: EntryType) => {
    if (entry.approved_by) return;
    setScreen({ name: "edit-entry", entry });
  };

  const openDuplicateEntry = (entry: EntryType) =>
    setScreen({ name: "add-entry", draft: { mode: "duplicate", entry } });

  const goToTimers = () => setScreen(TIMERS_SCREEN);

  if (screen.name === "add-entry") {
    // Duplicating starts from the entries list, so return there on
    // submit/cancel; manual and timer entries start from the timers list.
    const done = screen.draft.mode === "duplicate" ? openEntries : goToTimers;
    return (
      <ErrorBoundary>
        <AddEntryView draft={screen.draft} onSubmit={done} onCancel={done} />
      </ErrorBoundary>
    );
  }

  if (screen.name === "edit-entry") {
    return (
      <ErrorBoundary>
        <EditEntryView
          entry={screen.entry}
          onSubmit={openEntries}
          onCancel={openEntries}
        />
      </ErrorBoundary>
    );
  }

  if (screen.name === "entries") {
    return (
      <ErrorBoundary>
        <EntriesView
          onCancel={goToTimers}
          onEditEntry={openEditEntry}
          onDuplicateEntry={openDuplicateEntry}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <TimersView
        onAddEntry={openManualEntry}
        onLogTimer={openTimerLog}
        onViewEntries={openEntries}
      />
    </ErrorBoundary>
  );
}
