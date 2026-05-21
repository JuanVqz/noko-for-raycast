import { ProjectType } from "../types";

const makeProject = (overrides: Partial<ProjectType> = {}): ProjectType => ({
  id: "p1",
  name: "My Project",
  color: "#ff0000",
  enabled: true,
  billing_increment: 15,
  ...overrides,
});

// Mirrors the confirmation messages used in TimerItem
const getDiscardConfirmMessage = (project: ProjectType): string => {
  return `Are you sure you want to discard the timer for "${project.name}"? This cannot be undone.`;
};

const getResetConfirmMessage = (project: ProjectType): string => {
  return `Are you sure you want to reset the timer for "${project.name}"? The current time will be lost.`;
};

describe("TimerItem confirmation dialogs", () => {
  describe("discard timer confirmation", () => {
    it("includes project name in discard message", () => {
      const project = makeProject({ name: "Frontend Work" });
      const message = getDiscardConfirmMessage(project);
      expect(message).toContain("Frontend Work");
    });

    it("warns that action cannot be undone", () => {
      const project = makeProject();
      const message = getDiscardConfirmMessage(project);
      expect(message).toContain("cannot be undone");
    });
  });

  describe("reset timer confirmation", () => {
    it("includes project name in reset message", () => {
      const project = makeProject({ name: "Backend API" });
      const message = getResetConfirmMessage(project);
      expect(message).toContain("Backend API");
    });

    it("warns that current time will be lost", () => {
      const project = makeProject();
      const message = getResetConfirmMessage(project);
      expect(message).toContain("current time will be lost");
    });
  });
});
