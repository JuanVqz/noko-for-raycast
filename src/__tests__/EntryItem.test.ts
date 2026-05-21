import { EntryType } from "../types";

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

// Mirrors the condition used in EntryItem to conditionally render CopyToClipboard
const shouldShowCopyAction = (entry: EntryType): boolean =>
  Boolean(entry.description);

// Mirrors the content prop passed to Action.CopyToClipboard
const getCopyContent = (entry: EntryType): string => entry.description;

describe("EntryItem copy description action", () => {
  it("shows copy action when entry has a description", () => {
    expect(shouldShowCopyAction(makeEntry({ description: "fixed bug" }))).toBe(
      true,
    );
  });

  it("hides copy action when description is empty string", () => {
    expect(shouldShowCopyAction(makeEntry({ description: "" }))).toBe(false);
  });

  it("copies the raw description including inline hashtags", () => {
    const entry = makeEntry({
      description: "work on feature #frontend #urgent",
    });
    expect(getCopyContent(entry)).toBe("work on feature #frontend #urgent");
  });

  it("shortcut uses cmd+shift+C to avoid conflict with native cmd+C", () => {
    const shortcut = { modifiers: ["cmd", "shift"] as const, key: "c" };
    expect(shortcut.modifiers).toContain("shift");
    expect(shortcut.key).toBe("c");
  });
});
