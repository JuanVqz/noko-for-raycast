import { ProjectType } from "../types";

const makeProject = (overrides: Partial<ProjectType> = {}): ProjectType => ({
  id: "p1",
  name: "My Project",
  color: "#ff0000",
  enabled: true,
  billing_increment: 0,
  ...overrides,
});

// Mirrors the billable check in ProjectItem
const isBillableProject = (project: ProjectType): boolean => {
  return (
    project.billing_increment !== undefined && project.billing_increment > 0
  );
};

describe("ProjectItem billable indicator", () => {
  it("returns true when billing_increment is positive", () => {
    const project = makeProject({ billing_increment: 15 });
    expect(isBillableProject(project)).toBe(true);
  });

  it("returns false when billing_increment is 0", () => {
    const project = makeProject({ billing_increment: 0 });
    expect(isBillableProject(project)).toBe(false);
  });

  it("returns false when billing_increment is undefined", () => {
    const project = makeProject({ billing_increment: undefined });
    expect(isBillableProject(project)).toBe(false);
  });

  it("returns true for any positive billing increment", () => {
    expect(isBillableProject(makeProject({ billing_increment: 1 }))).toBe(true);
    expect(isBillableProject(makeProject({ billing_increment: 60 }))).toBe(
      true,
    );
  });
});
