import { combineDescriptionAndTags } from "../utils/description-utils";

describe("combineDescriptionAndTags", () => {
  it("combines description and tags with a space", () => {
    expect(combineDescriptionAndTags("fixed bug", ["backend", "urgent"])).toBe(
      "fixed bug backend urgent",
    );
  });

  it("returns description only when tags is empty", () => {
    expect(combineDescriptionAndTags("fixed bug", [])).toBe("fixed bug");
  });

  it("returns tags only when description is empty", () => {
    expect(combineDescriptionAndTags("", ["backend"])).toBe("backend");
  });

  it("trims surrounding whitespace", () => {
    expect(combineDescriptionAndTags("  work  ", [])).toBe("work");
    expect(combineDescriptionAndTags("", [])).toBe("");
  });

  it("handles single tag", () => {
    expect(combineDescriptionAndTags("desc", ["tag"])).toBe("desc tag");
  });
});
