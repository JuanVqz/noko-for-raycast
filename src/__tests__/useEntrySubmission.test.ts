import { renderHook, act } from "@testing-library/react";
import { useEntrySubmission } from "../hooks/useEntrySubmission";
import { apiClient } from "../lib/api-client";
import { showSuccessToast, showErrorToast } from "../utils";

jest.mock("../lib/api-client", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock("../utils", () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
  parseTimeInput: jest.requireActual("../utils").parseTimeInput,
  combineDescriptionAndTags:
    jest.requireActual("../utils").combineDescriptionAndTags,
  dateOnTimezone: jest.fn(() => "2024-01-15"),
}));

jest.mock("@raycast/api", () => ({
  getPreferenceValues: jest.fn(() => ({ timezone: "America/New_York" })),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const baseEntry = {
  minutes: "60",
  project_name: "Test Project",
  description: "Worked on feature",
  tags: [] as string[],
  date: new Date("2024-01-15"),
};

describe("useEntrySubmission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits entry successfully and calls onSuccess", async () => {
    mockApiClient.post.mockResolvedValueOnce({ success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useEntrySubmission({ onSuccess }));

    await act(async () => {
      await result.current.submitEntry(baseEntry);
    });

    expect(mockApiClient.post).toHaveBeenCalledWith("/entries", {
      minutes: 60,
      project_name: "Test Project",
      description: "Worked on feature",
      date: "2024-01-15",
    });
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Entry Added",
      "Time entry has been added successfully",
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("combines description and tags before submitting", async () => {
    mockApiClient.post.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useEntrySubmission());

    await act(async () => {
      await result.current.submitEntry({
        ...baseEntry,
        tags: ["frontend", "react"],
      });
    });

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/entries",
      expect.objectContaining({
        description: "Worked on feature frontend react",
      }),
    );
  });

  it("shows error toast when API returns failure", async () => {
    mockApiClient.post.mockResolvedValueOnce({
      success: false,
      error: "Project not found",
    });

    const { result } = renderHook(() => useEntrySubmission());

    await act(async () => {
      await result.current.submitEntry(baseEntry);
    });

    expect(showErrorToast).toHaveBeenCalledWith(
      "Failed to Add Entry",
      "Project not found",
    );
  });

  it("shows fallback error when API failure has no message", async () => {
    mockApiClient.post.mockResolvedValueOnce({ success: false });

    const { result } = renderHook(() => useEntrySubmission());

    await act(async () => {
      await result.current.submitEntry(baseEntry);
    });

    expect(showErrorToast).toHaveBeenCalledWith(
      "Failed to Add Entry",
      "Failed to create entry",
    );
  });

  it("shows error toast on network error", async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useEntrySubmission());

    await act(async () => {
      await result.current.submitEntry(baseEntry);
    });

    expect(showErrorToast).toHaveBeenCalledWith(
      "Failed to Add Entry",
      "Network error",
    );
  });

  it("shows error toast on invalid time format", async () => {
    const { result } = renderHook(() => useEntrySubmission());

    await act(async () => {
      await result.current.submitEntry({ ...baseEntry, minutes: "not-a-time" });
    });

    expect(showErrorToast).toHaveBeenCalledWith(
      "Failed to Add Entry",
      expect.stringContaining("Invalid time format"),
    );
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  it("does not call onSuccess on failure", async () => {
    mockApiClient.post.mockResolvedValueOnce({
      success: false,
      error: "Error",
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useEntrySubmission({ onSuccess }));

    await act(async () => {
      await result.current.submitEntry(baseEntry);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
