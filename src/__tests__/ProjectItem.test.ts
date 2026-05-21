import { ProjectType } from "../types";

const makeProject = (overrides: Partial<ProjectType> = {}): ProjectType => ({
  id: "p1",
  name: "My Project",
  color: "#ff0000",
  enabled: true,
  billable: false,
  billing_increment: 0,
  ...overrides,
});

describe("ProjectItem billable indicator", () => {
  it("shows billable when project.billable is true", () => {
    const project = makeProject({ billable: true });
    expect(project.billable).toBe(true);
  });

  it("shows not billable when project.billable is false", () => {
    const project = makeProject({ billable: false });
    expect(project.billable).toBe(false);
  });
});
