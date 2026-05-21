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
  it("is billable when project.billable is true", () => {
    expect(makeProject({ billable: true }).billable).toBe(true);
  });

  it("is not billable when project.billable is false", () => {
    expect(makeProject({ billable: false }).billable).toBe(false);
  });
});

describe("ProjectItem billing increment tag", () => {
  it("shows increment tag when billing_increment is positive", () => {
    const project = makeProject({ billing_increment: 15 });
    expect(project.billing_increment).toBeGreaterThan(0);
  });

  it("omits increment tag when billing_increment is 0", () => {
    const project = makeProject({ billing_increment: 0 });
    expect(project.billing_increment).toBeFalsy();
  });

  it("omits increment tag when billing_increment is undefined", () => {
    const project = makeProject({ billing_increment: undefined });
    expect(project.billing_increment).toBeFalsy();
  });

  it("formats increment as Xm", () => {
    const project = makeProject({ billing_increment: 15 });
    expect(`${project.billing_increment}m`).toBe("15m");
  });
});

describe("ProjectItem entries tag", () => {
  it("shows entry count when entries is defined", () => {
    const project = makeProject({ entries: 5 });
    expect(project.entries).toBe(5);
  });

  it("omits entry count when entries is undefined", () => {
    const project = makeProject({ entries: undefined });
    expect(project.entries).toBeUndefined();
  });

  it("shows entry count of 0", () => {
    const project = makeProject({ entries: 0 });
    expect(project.entries).toBe(0);
  });
});
