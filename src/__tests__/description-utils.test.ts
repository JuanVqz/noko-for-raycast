import {
  combineDescriptionAndTags,
  stripTagsFromDescription,
} from "../utils/description-utils";

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

describe("stripTagsFromDescription", () => {
  it("removes hashtag tokens from description", () => {
    expect(stripTagsFromDescription("fixed bug #backend #urgent")).toBe(
      "fixed bug",
    );
  });

  it("returns description unchanged when no hashtags", () => {
    expect(stripTagsFromDescription("fixed bug")).toBe("fixed bug");
  });

  it("returns empty string when only hashtags", () => {
    expect(stripTagsFromDescription("#backend #urgent")).toBe("");
  });

  it("removes hashtag in the middle", () => {
    expect(stripTagsFromDescription("fixed #backend bug")).toBe("fixed bug");
  });

  it("trims extra whitespace after removal", () => {
    expect(stripTagsFromDescription("  fixed bug #backend  ")).toBe(
      "fixed bug",
    );
  });

  it("handles empty string", () => {
    expect(stripTagsFromDescription("")).toBe("");
  });
});
