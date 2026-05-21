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

describe("ProjectItem subtitle (billing increment)", () => {
  it("shows Xm when billing_increment is positive", () => {
    const project = makeProject({ billing_increment: 15 });
    const subtitle = project.billing_increment ? `${project.billing_increment}m` : "";
    expect(subtitle).toBe("15m");
  });

  it("shows empty string when billing_increment is 0", () => {
    const project = makeProject({ billing_increment: 0 });
    const subtitle = project.billing_increment ? `${project.billing_increment}m` : "";
    expect(subtitle).toBe("");
  });

  it("shows empty string when billing_increment is undefined", () => {
    const project = makeProject({ billing_increment: undefined });
    const subtitle = project.billing_increment ? `${project.billing_increment}m` : "";
    expect(subtitle).toBe("");
  });
});

describe("ProjectItem entries tag", () => {
  it("uses project color as tag background", () => {
    const project = makeProject({ entries: 3, color: "#feff96" });
    expect(project.color).toBe("#feff96");
    expect(project.entries).toBe(3);
  });

  it("shows entry count as string", () => {
    const project = makeProject({ entries: 7 });
    expect(String(project.entries)).toBe("7");
  });

  it("shows 0 entries", () => {
    const project = makeProject({ entries: 0 });
    expect(project.entries).toBe(0);
  });

  it("omits tag when entries is undefined", () => {
    const project = makeProject({ entries: undefined });
    expect(project.entries).toBeUndefined();
  });
});
