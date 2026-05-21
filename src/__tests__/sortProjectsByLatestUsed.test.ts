import { EntryType, ProjectType } from "../types";

const makeProject = (id: string, name: string): ProjectType => ({
  id,
  name,
  color: "#ff0000",
  enabled: true,
});

const makeEntry = (projectId: string, date: string): Partial<EntryType> => ({
  id: `${projectId}-${date}`,
  date,
  project: { id: projectId, name: "P", color: "#000", enabled: true },
});

// Mirrors latestUsedByProject computation in TimersView
const buildLatestUsed = (
  entries: Partial<EntryType>[],
): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const entry of entries) {
    if (entry.project && entry.date) {
      const current = map[entry.project.id];
      if (!current || entry.date > current) {
        map[entry.project.id] = entry.date;
      }
    }
  }
  return map;
};

// Mirrors sort logic in TimersView
const sortProjects = (
  projects: ProjectType[],
  latestUsed: Record<string, string>,
): ProjectType[] => {
  return [...projects].sort((a, b) => {
    const dateA = latestUsed[a.id] ?? "";
    const dateB = latestUsed[b.id] ?? "";
    if (dateA === dateB) return a.name.localeCompare(b.name);
    return dateB.localeCompare(dateA);
  });
};

describe("sort projects by latest used", () => {
  it("returns projects ordered by most recent usage first", () => {
    const projects = [
      makeProject("p1", "Alpha"),
      makeProject("p2", "Beta"),
      makeProject("p3", "Gamma"),
    ];
    const entries = [
      makeEntry("p1", "2026-05-10"),
      makeEntry("p2", "2026-05-18"),
      makeEntry("p3", "2026-05-15"),
    ];
    const latestUsed = buildLatestUsed(entries);
    const sorted = sortProjects(projects, latestUsed);
    expect(sorted.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
  });

  it("places projects with no entries at the end", () => {
    const projects = [makeProject("p1", "Active"), makeProject("p2", "Unused")];
    const entries = [makeEntry("p1", "2026-05-20")];
    const latestUsed = buildLatestUsed(entries);
    const sorted = sortProjects(projects, latestUsed);
    expect(sorted[0].id).toBe("p1");
    expect(sorted[1].id).toBe("p2");
  });

  it("breaks ties alphabetically by name", () => {
    const projects = [makeProject("p1", "Zebra"), makeProject("p2", "Apple")];
    const latestUsed = buildLatestUsed([]); // no entries, both have same ""
    const sorted = sortProjects(projects, latestUsed);
    expect(sorted[0].name).toBe("Apple");
    expect(sorted[1].name).toBe("Zebra");
  });

  it("picks the most recent date when project has multiple entries", () => {
    const entries = [
      makeEntry("p1", "2026-05-01"),
      makeEntry("p1", "2026-05-20"),
      makeEntry("p1", "2026-05-10"),
    ];
    const latestUsed = buildLatestUsed(entries);
    expect(latestUsed["p1"]).toBe("2026-05-20");
  });
});
