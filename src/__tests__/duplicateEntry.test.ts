import { EntryType } from "../types";
import { stripTagsFromDescription, formatMinutesAsTime } from "../utils";

const makeEntry = (overrides: Partial<EntryType> = {}): EntryType => ({
  id: "1",
  date: "2026-05-01",
  billable: true,
  minutes: 90,
  formatted_minutes: "1:30",
  description: "fixed bug #backend #urgent",
  approved_by: null,
  approved_at: "",
  user: {
    id: "u1",
    email: "user@example.com",
    first_name: "Jane",
    last_name: "Doe",
    profile_image_url: "",
  },
  tags: [
    { id: "t1", name: "backend", formatted_name: "#backend" },
    { id: "t2", name: "urgent", formatted_name: "#urgent" },
  ],
  project: {
    id: "p1",
    name: "My Project",
    color: "#ff0000",
    enabled: true,
    billable: true,
    billing_increment: 15,
  },
  ...overrides,
});

// Mirrors the pre-fill logic applied in AddEntryView when prefillEntry is set
const buildPrefill = (entry: EntryType) => ({
  minutesValue: formatMinutesAsTime(entry.minutes),
  description: stripTagsFromDescription(entry.description),
  tags: entry.tags?.map((t) => t.formatted_name) ?? [],
  projectName: entry.project.name,
});

describe("duplicate entry pre-fill", () => {
  it("pre-fills minutes from the original entry", () => {
    const entry = makeEntry({ minutes: 90 });
    const prefill = buildPrefill(entry);
    expect(prefill.minutesValue).toBe("1:30");
  });

  it("strips hashtags from description before pre-filling", () => {
    const entry = makeEntry({ description: "fixed bug #backend #urgent" });
    const prefill = buildPrefill(entry);
    expect(prefill.description).toBe("fixed bug");
  });

  it("pre-fills tags from original entry", () => {
    const entry = makeEntry();
    const prefill = buildPrefill(entry);
    expect(prefill.tags).toEqual(["#backend", "#urgent"]);
  });

  it("pre-fills project name from original entry", () => {
    const entry = makeEntry({
      project: {
        id: "p2",
        name: "Backend API",
        color: "#blue",
        enabled: true,
        billable: true,
      },
    });
    const prefill = buildPrefill(entry);
    expect(prefill.projectName).toBe("Backend API");
  });

  it("handles entry with no tags", () => {
    const entry = makeEntry({ tags: [], description: "clean description" });
    const prefill = buildPrefill(entry);
    expect(prefill.tags).toEqual([]);
    expect(prefill.description).toBe("clean description");
  });

  it("handles null tags gracefully", () => {
    const entry = makeEntry({ tags: null as unknown as EntryType["tags"] });
    const prefill = buildPrefill(entry);
    expect(prefill.tags).toEqual([]);
  });

  it("handles empty description", () => {
    const entry = makeEntry({ description: "" });
    const prefill = buildPrefill(entry);
    expect(prefill.description).toBe("");
  });

  it("handles description with only tags", () => {
    const entry = makeEntry({ description: "#backend #urgent" });
    const prefill = buildPrefill(entry);
    expect(prefill.description).toBe("");
  });
});
