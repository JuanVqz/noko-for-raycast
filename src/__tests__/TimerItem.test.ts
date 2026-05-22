import { ProjectType } from "../types";
import { TIMER_CONFIRM_MESSAGES } from "../constants";

const makeProject = (overrides: Partial<ProjectType> = {}): ProjectType => ({
  id: "p1",
  name: "My Project",
  color: "#ff0000",
  enabled: true,
  billing_increment: 15,
  ...overrides,
});

describe("TimerItem confirmation dialogs", () => {
  describe("discard timer confirmation", () => {
    it("includes project name in discard message", () => {
      const project = makeProject({ name: "Frontend Work" });
      const message = TIMER_CONFIRM_MESSAGES.DISCARD.getMessage(project.name);
      expect(message).toContain("Frontend Work");
    });

    it("warns that action cannot be undone", () => {
      const project = makeProject();
      const message = TIMER_CONFIRM_MESSAGES.DISCARD.getMessage(project.name);
      expect(message).toContain("cannot be undone");
    });
  });

  describe("reset timer confirmation", () => {
    it("includes project name in reset message", () => {
      const project = makeProject({ name: "Backend API" });
      const message = TIMER_CONFIRM_MESSAGES.RESET.getMessage(project.name);
      expect(message).toContain("Backend API");
    });

    it("warns that recorded time will be cleared", () => {
      const project = makeProject();
      const message = TIMER_CONFIRM_MESSAGES.RESET.getMessage(project.name);
      expect(message).toContain("recorded time will be cleared");
    });
  });
});
