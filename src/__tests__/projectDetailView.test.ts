import { EntryType } from "../types";
import { buildWeekMinutesByProject } from "../utils/project-utils";

const makeEntry = (projectId: string, minutes: number): EntryType => ({
  id: `${projectId}-${minutes}`,
  date: "2026-05-20",
  billable: true,
  minutes,
  formatted_minutes: "",
  description: "",
  approved_by: null,
  approved_at: "",
  user: {
    id: "u1",
    email: "user@example.com",
    first_name: "Jane",
    last_name: "Doe",
    profile_image_url: "",
  },
  tags: [],
  project: {
    id: projectId,
    name: "Project",
    color: "#ff0000",
    enabled: true,
    billable: true,
  },
});

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

  it("skips entries with null project", () => {
    const entry = makeEntry("p1", 60);
    const entryNoProject = {
      ...entry,
      project: null as unknown as EntryType["project"],
    };
    const result = buildWeekMinutesByProject([entry, entryNoProject]);
    expect(result["p1"]).toBe(60);
    expect(Object.keys(result)).toHaveLength(1);
  });
});
