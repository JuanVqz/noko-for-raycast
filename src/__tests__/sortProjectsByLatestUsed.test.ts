import { EntryType, ProjectType } from "../types";
import {
  buildLatestUsedByProject,
  sortProjectsByLatestUsed,
} from "../utils/project-utils";

const makeProject = (id: string, name: string): ProjectType => ({
  id,
  name,
  color: "#ff0000",
  enabled: true,
});

const makeEntry = (projectId: string, date: string): EntryType => ({
  id: `${projectId}-${date}`,
  date,
  billable: true,
  minutes: 60,
  formatted_minutes: "1:00",
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
  project: { id: projectId, name: "P", color: "#000", enabled: true },
});

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
    const latestUsed = buildLatestUsedByProject(entries);
    const sorted = sortProjectsByLatestUsed(projects, latestUsed);
    expect(sorted.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
  });

  it("places projects with no entries at the end", () => {
    const projects = [makeProject("p1", "Active"), makeProject("p2", "Unused")];
    const entries = [makeEntry("p1", "2026-05-20")];
    const latestUsed = buildLatestUsedByProject(entries);
    const sorted = sortProjectsByLatestUsed(projects, latestUsed);
    expect(sorted[0].id).toBe("p1");
    expect(sorted[1].id).toBe("p2");
  });

  it("breaks ties alphabetically by name", () => {
    const projects = [makeProject("p1", "Zebra"), makeProject("p2", "Apple")];
    const latestUsed = buildLatestUsedByProject([]); // no entries, both have same ""
    const sorted = sortProjectsByLatestUsed(projects, latestUsed);
    expect(sorted[0].name).toBe("Apple");
    expect(sorted[1].name).toBe("Zebra");
  });

  it("picks the most recent date when project has multiple entries", () => {
    const entries = [
      makeEntry("p1", "2026-05-01"),
      makeEntry("p1", "2026-05-20"),
      makeEntry("p1", "2026-05-10"),
    ];
    const latestUsed = buildLatestUsedByProject(entries);
    expect(latestUsed["p1"]).toBe("2026-05-20");
  });
});
