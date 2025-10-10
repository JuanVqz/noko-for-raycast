import { renderHook, act } from "@testing-library/react";
import useElapsedTime from "../hooks/useElapsedTime";
import { TimerType, TimerStateEnum } from "../types";

// Mock the getElapsedTime utility function
jest.mock("../utils", () => ({
  getElapsedTime: jest.fn(),
}));

import { getElapsedTime } from "../utils";
const mockGetElapsedTime = getElapsedTime as jest.MockedFunction<
  typeof getElapsedTime
>;

describe("useElapsedTime", () => {
  const mockTimer: TimerType = {
    id: "1",
    state: TimerStateEnum.Running,
    date: "2024-01-01",
    seconds: 3600,
    formatted_time: "01:00:00",
    description: "Test timer",
    user: {
      id: "1",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      profile_image_url: "",
    },
    project: {
      id: "1",
      name: "Test Project",
      color: "#ff0000",
      enabled: true,
    },
    url: "",
    start_url: "",
    pause_url: "",
    add_or_subtract_time_url: "",
    log_url: "",
    log_inbox_entry_url: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetElapsedTime.mockReturnValue("01:00:00");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return null when no timer is provided", () => {
    const { result } = renderHook(() => useElapsedTime(null));

    expect(result.current).toBeNull();
    expect(mockGetElapsedTime).not.toHaveBeenCalled();
  });

  it("should return elapsed time for running timer", () => {
    const { result } = renderHook(() => useElapsedTime(mockTimer));

    expect(result.current).toBe("01:00:00");
    expect(mockGetElapsedTime).toHaveBeenCalledWith(
      mockTimer,
      expect.any(Date),
      expect.any(Date),
    );
  });

  it("should return elapsed time for paused timer", () => {
    const pausedTimer = { ...mockTimer, state: TimerStateEnum.Paused };
    const { result } = renderHook(() => useElapsedTime(pausedTimer));

    expect(result.current).toBe("01:00:00");
    expect(mockGetElapsedTime).toHaveBeenCalledWith(
      pausedTimer,
      expect.any(Date),
      expect.any(Date),
    );
  });

  it("should update elapsed time every second for running timer", () => {
    renderHook(() => useElapsedTime(mockTimer));

    // Initial render calls it twice (initial state + effect)
    expect(mockGetElapsedTime).toHaveBeenCalled();
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockGetElapsedTime.mock.calls.length).toBeGreaterThan(initialCalls);

    const callsAfterFirst = mockGetElapsedTime.mock.calls.length;

    // Advance time by another second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockGetElapsedTime.mock.calls.length).toBeGreaterThan(
      callsAfterFirst,
    );
  });

  it("should not update elapsed time for paused timer", () => {
    const pausedTimer = { ...mockTimer, state: TimerStateEnum.Paused };
    renderHook(() => useElapsedTime(pausedTimer));

    // Initial call
    expect(mockGetElapsedTime).toHaveBeenCalledTimes(1);

    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still only be called once (no interval for paused timers)
    expect(mockGetElapsedTime).toHaveBeenCalledTimes(1);
  });

  it("should clear interval when timer changes", () => {
    const { rerender } = renderHook(({ timer }) => useElapsedTime(timer), {
      initialProps: { timer: mockTimer },
    });

    // Initial setup
    expect(mockGetElapsedTime).toHaveBeenCalled();
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const callsAfterFirst = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(initialCalls);

    // Change timer
    const newTimer = { ...mockTimer, id: "2" };
    rerender({ timer: newTimer });

    // Should reset and call again
    expect(mockGetElapsedTime.mock.calls.length).toBeGreaterThan(
      callsAfterFirst,
    );

    // Timer continues to update
    const callsBeforeAdvance = mockGetElapsedTime.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockGetElapsedTime.mock.calls.length).toBeGreaterThan(
      callsBeforeAdvance,
    );
  });

  it("should clear interval when timer becomes null", () => {
    const { rerender } = renderHook(
      ({ timer }: { timer: TimerType | null }) => useElapsedTime(timer),
      { initialProps: { timer: mockTimer as TimerType | null } },
    );

    // Initial setup
    expect(mockGetElapsedTime).toHaveBeenCalled();
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const callsAfterFirst = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(initialCalls);

    // Set timer to null
    rerender({ timer: null });

    const callsAfterNull = mockGetElapsedTime.mock.calls.length;

    // Advance time - should not trigger more calls
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still be the same (no more calls after null)
    expect(mockGetElapsedTime.mock.calls.length).toBe(callsAfterNull);
  });

  it("should clear interval when timer state changes from running to paused", () => {
    const { rerender } = renderHook(({ timer }) => useElapsedTime(timer), {
      initialProps: { timer: mockTimer },
    });

    // Initial setup
    expect(mockGetElapsedTime).toHaveBeenCalled();
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const callsAfterFirst = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(initialCalls);

    // Change timer state to paused
    const pausedTimer = { ...mockTimer, state: TimerStateEnum.Paused };
    rerender({ timer: pausedTimer });

    // Should call again for the new timer
    const callsAfterPause = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterPause).toBeGreaterThan(callsAfterFirst);

    // Advance time - should not trigger more calls for paused timer
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still be the same (no interval for paused)
    expect(mockGetElapsedTime.mock.calls.length).toBe(callsAfterPause);
  });

  it("should clear interval on unmount", () => {
    const { unmount } = renderHook(() => useElapsedTime(mockTimer));

    // Initial setup
    expect(mockGetElapsedTime).toHaveBeenCalled();
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const callsAfterFirst = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(initialCalls);

    // Unmount
    unmount();

    const callsAfterUnmount = mockGetElapsedTime.mock.calls.length;

    // Advance time - should not trigger more calls
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still be the same (no more calls after unmount)
    expect(mockGetElapsedTime.mock.calls.length).toBe(callsAfterUnmount);
  });
});
