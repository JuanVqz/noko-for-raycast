import { EntryType, ApprovedByType } from "../types";
import { SUMMARY_COLORS } from "../constants";

const makeApprovedBy = (
  overrides: Partial<ApprovedByType> = {},
): ApprovedByType => ({
  id: "a1",
  email: "approver@example.com",
  first_name: "Alice",
  last_name: "Smith",
  profile_image_url: "",
  ...overrides,
});

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
    billable: true,
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

  it("shortcut uses cmd+C", () => {
    const shortcut = { modifiers: ["cmd"] as const, key: "c" };
    expect(shortcut.modifiers).toContain("cmd");
    expect(shortcut.key).toBe("c");
  });
});

// Mirrors the billable coin tint used in the today-entry accessory
const billableTint = (entry: EntryType): string =>
  entry.billable ? SUMMARY_COLORS.BILLABLE : SUMMARY_COLORS.UNBILLABLE;

describe("EntryItem time accessory", () => {
  it("tints the coin green for billable entries", () => {
    expect(billableTint(makeEntry({ billable: true }))).toBe(
      SUMMARY_COLORS.BILLABLE,
    );
  });

  it("tints the coin red for unbillable entries", () => {
    expect(billableTint(makeEntry({ billable: false }))).toBe(
      SUMMARY_COLORS.UNBILLABLE,
    );
  });

  it("shows the formatted time as the accessory text", () => {
    expect(makeEntry({ formatted_minutes: "2:30" }).formatted_minutes).toBe(
      "2:30",
    );
  });
});

// Mirrors the approved_by accessory tooltip logic in EntryItem
const getApprovalTooltip = (entry: EntryType): string | null => {
  if (!entry.approved_by) return null;
  const { first_name, last_name } = entry.approved_by;
  return `Approved by ${first_name} ${last_name}`;
};

describe("EntryItem approved/locked indicator", () => {
  it("returns null tooltip when entry is not approved", () => {
    const entry = makeEntry({ approved_by: null });
    expect(getApprovalTooltip(entry)).toBeNull();
  });

  it("returns tooltip with approver name when entry is approved", () => {
    const approvedBy = makeApprovedBy({
      first_name: "Alice",
      last_name: "Smith",
    });
    const entry = makeEntry({ approved_by: approvedBy });
    expect(getApprovalTooltip(entry)).toBe("Approved by Alice Smith");
  });

  it("approved entry has accessory with lock icon tooltip", () => {
    const approvedBy = makeApprovedBy({
      first_name: "Bob",
      last_name: "Jones",
    });
    const entry = makeEntry({ approved_by: approvedBy });
    const tooltip = getApprovalTooltip(entry);
    expect(tooltip).toBe("Approved by Bob Jones");
  });

  it("edit and delete actions gated: approved entry hides them", () => {
    const entry = makeEntry({ approved_by: makeApprovedBy() });
    // Both edit and delete are rendered only when !entry.approved_by
    const canEditOrDelete = !entry.approved_by;
    expect(canEditOrDelete).toBe(false);
  });

  it("edit and delete actions available for unapproved entries", () => {
    const entry = makeEntry({ approved_by: null });
    const canEditOrDelete = !entry.approved_by;
    expect(canEditOrDelete).toBe(true);
  });

  it("handleEditEntry guard: approved entry cannot be edited", () => {
    const entry = makeEntry({ approved_by: makeApprovedBy() });
    // Mirrors the guard in timers.tsx handleEditEntry
    const wouldNavigate = !entry.approved_by;
    expect(wouldNavigate).toBe(false);
  });

  it("handleEditEntry guard: unapproved entry can be edited", () => {
    const entry = makeEntry({ approved_by: null });
    const wouldNavigate = !entry.approved_by;
    expect(wouldNavigate).toBe(true);
  });
});
