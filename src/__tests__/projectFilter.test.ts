// Tests the URL generation logic for project filter values
const buildProjectsUrl = (
  filter: "active" | "archived" | "all" = "active",
): string => {
  const params =
    filter === "active"
      ? "enabled=true&per_page=100"
      : filter === "archived"
        ? "enabled=false&per_page=100"
        : "per_page=100";
  return `/projects?${params}`;
};

describe("project filter URL generation", () => {
  it("active filter includes enabled=true", () => {
    expect(buildProjectsUrl("active")).toBe(
      "/projects?enabled=true&per_page=100",
    );
  });

  it("archived filter includes enabled=false", () => {
    expect(buildProjectsUrl("archived")).toBe(
      "/projects?enabled=false&per_page=100",
    );
  });

  it("all filter omits enabled param", () => {
    expect(buildProjectsUrl("all")).toBe("/projects?per_page=100");
  });

  it("defaults to active filter", () => {
    expect(buildProjectsUrl()).toBe("/projects?enabled=true&per_page=100");
  });
});
