import { EntryType } from "../types";

// Mirrors the condition used in EntryItem to decide whether to show the copy action
const getCopyDescription = (entry: EntryType): string | null => {
  return entry.description || null;
};

const makeEntry = (overrides: Partial<EntryType> = {}): EntryType => ({
  id: "1",
  date: "2026-05-20",
  billable: true,
  minutes: 60,
  formatted_minutes: "1:00",
  description: "fixed bug #backend",
  approved_by: null,
  approved_at: "",
  user: {
    id: "u1",
    email: "user@example.com",
    first_name: "Jane",
    last_name: "Doe",
    profile_image_url: "",
  },
  tags: [{ id: "t1", name: "backend", formatted_name: "#backend" }],
  project: {
    id: "p1",
    name: "My Project",
    color: "#ff0000",
    enabled: true,
    billing_increment: 15,
  },
  ...overrides,
});

describe("EntryItem copy description", () => {
  it("returns description when entry has description", () => {
    const entry = makeEntry({ description: "fixed bug #backend" });
    expect(getCopyDescription(entry)).toBe("fixed bug #backend");
  });

  it("returns null when description is empty string", () => {
    const entry = makeEntry({ description: "" });
    expect(getCopyDescription(entry)).toBeNull();
  });

  it("copies the raw description including hashtags", () => {
    const entry = makeEntry({
      description: "work on feature #frontend #urgent",
    });
    expect(getCopyDescription(entry)).toBe("work on feature #frontend #urgent");
  });
});
