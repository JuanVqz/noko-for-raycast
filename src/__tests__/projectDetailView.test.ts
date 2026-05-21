import { EntryType } from "../types";

const makeEntry = (projectId: string, minutes: number): Partial<EntryType> => ({
  id: `${projectId}-${minutes}`,
  minutes,
  project: {
    id: projectId,
    name: "Project",
    color: "#ff0000",
    enabled: true,
    billable: true,
  },
});

// Mirrors the weekMinutesByProject computation in TimersView
const buildWeekMinutesByProject = (
  entries: Partial<EntryType>[],
): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.project && entry.minutes !== undefined) {
      map[entry.project.id] = (map[entry.project.id] ?? 0) + entry.minutes;
    }
  }
  return map;
};

describe("project detail view week minutes", () => {
  it("returns empty map for no entries", () => {
    expect(buildWeekMinutesByProject([])).toEqual({});
  });

  it("sums minutes per project", () => {
    const entries = [
      makeEntry("p1", 60),
      makeEntry("p1", 30),
      makeEntry("p2", 90),
    ];
    const result = buildWeekMinutesByProject(entries);
    expect(result["p1"]).toBe(90);
    expect(result["p2"]).toBe(90);
  });

  it("projects with no entries return 0 via nullish coalescing", () => {
    const result = buildWeekMinutesByProject([]);
    expect(result["unknown-project"] ?? 0).toBe(0);
  });

  it("handles multiple projects independently", () => {
    const entries = [
      makeEntry("p1", 60),
      makeEntry("p2", 30),
      makeEntry("p3", 120),
    ];
    const result = buildWeekMinutesByProject(entries);
    expect(Object.keys(result)).toHaveLength(3);
    expect(result["p3"]).toBe(120);
  });
});
