import { renderHook } from "@testing-library/react";
import { useWeekEntries } from "../hooks/useApiData";
import { EntryType, UserType, ProjectType } from "../types";

jest.mock("../lib/api-client", () => ({
  apiClient: {
    headers: {
      "X-NokoToken": "test-token",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
}));

jest.mock("@raycast/utils", () => ({
  useFetch: jest.fn(),
}));

jest.mock("@raycast/api", () => ({
  getPreferenceValues: jest.fn(() => ({
    timezone: "America/New_York",
  })),
}));

import { useFetch } from "@raycast/utils";

const mockUseFetch = useFetch as jest.MockedFunction<typeof useFetch>;

describe("useWeekEntries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-10T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should fetch entries from Sunday to today (Wednesday)", () => {
    const mockEntries: EntryType[] = [
      {
        id: "1",
        date: "2024-01-07",
        billable: true,
        minutes: 480,
        formatted_minutes: "08:00",
        description: "Sunday work",
        approved_by: null,
        approved_at: "2024-01-07",
        user: {} as UserType,
        tags: [],
        project: {} as ProjectType,
      },
    ];

    mockUseFetch.mockReturnValue({
      data: mockEntries,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      revalidate: jest.fn(),
      pagination: undefined,
    });

    const { result } = renderHook(() => useWeekEntries());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockEntries);

    expect(mockUseFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/current_user/entries?from=2024-01-07&to=2024-01-10",
      ),
      expect.objectContaining({
        headers: expect.any(Object),
      }),
    );
  });

  it("should handle Monday as day 1 (week started Sunday)", () => {
    jest.setSystemTime(new Date("2024-01-08T12:00:00Z"));

    mockUseFetch.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      revalidate: jest.fn(),
      pagination: undefined,
    });

    renderHook(() => useWeekEntries());

    expect(mockUseFetch).toHaveBeenCalledWith(
      expect.stringContaining("from=2024-01-07&to=2024-01-08"),
      expect.any(Object),
    );
  });

  it("should handle Sunday (week starts on Sunday)", () => {
    jest.setSystemTime(new Date("2024-01-14T12:00:00Z"));

    mockUseFetch.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      revalidate: jest.fn(),
      pagination: undefined,
    });

    renderHook(() => useWeekEntries());

    expect(mockUseFetch).toHaveBeenCalledWith(
      expect.stringContaining("from=2024-01-14&to=2024-01-14"),
      expect.any(Object),
    );
  });

  it("should handle loading state", () => {
    mockUseFetch.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      mutate: jest.fn(),
      revalidate: jest.fn(),
      pagination: undefined,
    });

    const { result } = renderHook(() => useWeekEntries());

    expect(result.current.isLoading).toBe(true);
  });

  it("should handle API errors", () => {
    mockUseFetch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("API Error"),
      mutate: jest.fn(),
      revalidate: jest.fn(),
      pagination: undefined,
    });

    const { result } = renderHook(() => useWeekEntries());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});
