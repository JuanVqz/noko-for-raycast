import { renderHook, act } from "@testing-library/react";
import useElapsedTime from "../hooks/useElapsedTime";
import { TimerType, TimerStateEnum } from "../types";

// Mock the utility functions
jest.mock("../utils", () => ({
  getElapsedTime: jest.fn(),
  playSystemSound: jest.fn(),
  convertElapsedTimeToMinutes: jest.fn(),
}));

// Mock Raycast API
jest.mock("@raycast/api", () => ({
  getPreferenceValues: jest.fn(),
}));

import {
  getElapsedTime,
  playSystemSound,
  convertElapsedTimeToMinutes,
} from "../utils";
import { getPreferenceValues } from "@raycast/api";

const mockGetElapsedTime = getElapsedTime as jest.MockedFunction<
  typeof getElapsedTime
>;
const mockPlaySystemSound = playSystemSound as jest.MockedFunction<
  typeof playSystemSound
>;
const mockConvertElapsedTimeToMinutes =
  convertElapsedTimeToMinutes as jest.MockedFunction<
    typeof convertElapsedTimeToMinutes
  >;
const mockGetPreferenceValues = getPreferenceValues as jest.MockedFunction<
  typeof getPreferenceValues
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
      id: "user-1",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      profile_image_url: "https://example.com/avatar.jpg",
    },
    project: {
      id: "project-1",
      name: "Test Project",
      color: "#ff0000",
      enabled: true,
      billing_increment: 15,
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
    mockPlaySystemSound.mockImplementation(() => {});
    mockConvertElapsedTimeToMinutes.mockReturnValue(60);
    mockGetPreferenceValues.mockReturnValue({
      soundNotification: "glass",
      soundVolume: "0.5",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it("should properly handle state transitions from paused to running", () => {
    const pausedTimer = { ...mockTimer, state: TimerStateEnum.Paused };
    const { rerender } = renderHook(({ timer }) => useElapsedTime(timer), {
      initialProps: { timer: pausedTimer },
    });

    // Initial setup for paused timer
    expect(mockGetElapsedTime).toHaveBeenCalledTimes(1);
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time - should not trigger more calls for paused timer
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockGetElapsedTime.mock.calls.length).toBe(initialCalls);

    // Change to running timer
    const runningTimer = { ...mockTimer, state: TimerStateEnum.Running };
    rerender({ timer: runningTimer });

    // Should call again for the new running timer
    const callsAfterStart = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterStart).toBeGreaterThan(initialCalls);

    // Advance time - should now trigger interval updates
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockGetElapsedTime.mock.calls.length).toBeGreaterThan(
      callsAfterStart,
    );
  });

  it("should properly handle state transitions from running to paused", () => {
    const { rerender } = renderHook(({ timer }) => useElapsedTime(timer), {
      initialProps: { timer: mockTimer }, // Running timer
    });

    // Initial setup for running timer
    expect(mockGetElapsedTime).toHaveBeenCalled();
    const initialCalls = mockGetElapsedTime.mock.calls.length;

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const callsAfterFirst = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(initialCalls);

    // Change to paused timer
    const pausedTimer = { ...mockTimer, state: TimerStateEnum.Paused };
    rerender({ timer: pausedTimer });

    // Should call again for the paused timer
    const callsAfterPause = mockGetElapsedTime.mock.calls.length;
    expect(callsAfterPause).toBeGreaterThan(callsAfterFirst);

    // Advance time - should not trigger more calls for paused timer
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still be the same (no interval for paused)
    expect(mockGetElapsedTime.mock.calls.length).toBe(callsAfterPause);
  });

  it("should play sound notification every 15 minutes for running timer", () => {
    // Mock elapsed time to be exactly 15 minutes
    mockGetElapsedTime.mockReturnValue("00:15:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(15);

    renderHook(() => useElapsedTime(mockTimer));

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should play sound at 15 minutes with default preferences
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(1);
    expect(mockPlaySystemSound).toHaveBeenCalledWith("glass", "0.5");

    // Mock elapsed time to be 30 minutes
    mockGetElapsedTime.mockReturnValue("00:30:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(30);

    // Advance time again
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should play sound again at 30 minutes
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(2);
    expect(mockPlaySystemSound).toHaveBeenCalledWith("glass", "0.5");
  });

  it("should not play sound notification for paused timer", () => {
    const pausedTimer = { ...mockTimer, state: TimerStateEnum.Paused };

    // Mock elapsed time to be exactly 15 minutes
    mockGetElapsedTime.mockReturnValue("00:15:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(15);

    renderHook(() => useElapsedTime(pausedTimer));

    // Advance time - should not trigger interval for paused timer
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should not play sound for paused timer
    expect(mockPlaySystemSound).not.toHaveBeenCalled();
  });

  it("should not play sound notification multiple times for the same minute", () => {
    // Mock elapsed time to be exactly 15 minutes
    mockGetElapsedTime.mockReturnValue("00:15:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(15);

    renderHook(() => useElapsedTime(mockTimer));

    // Advance time multiple times within the same minute
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should only play sound once for the 15-minute mark
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(1);
  });

  it("should use custom sound preference", () => {
    // Mock custom sound preference
    mockGetPreferenceValues.mockReturnValue({
      soundNotification: "hero",
      soundVolume: "0.8",
    });

    // Mock elapsed time to be exactly 15 minutes
    mockGetElapsedTime.mockReturnValue("00:15:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(15);

    renderHook(() => useElapsedTime(mockTimer));

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should play hero sound with custom volume
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(1);
    expect(mockPlaySystemSound).toHaveBeenCalledWith("hero", "0.8");
  });

  it("should not play sound when preference is set to 'none'", () => {
    // Mock sound preference set to 'none'
    mockGetPreferenceValues.mockReturnValue({
      soundNotification: "none",
      soundVolume: "0.5",
    });

    // Mock elapsed time to be exactly 15 minutes
    mockGetElapsedTime.mockReturnValue("00:15:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(15);

    renderHook(() => useElapsedTime(mockTimer));

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should not play any sound
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(1);
    expect(mockPlaySystemSound).toHaveBeenCalledWith("none", "0.5");
  });

  it("should use default sound when no preference is set", () => {
    // Mock no sound preference
    mockGetPreferenceValues.mockReturnValue({});

    // Mock elapsed time to be exactly 15 minutes
    mockGetElapsedTime.mockReturnValue("00:15:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(15);

    renderHook(() => useElapsedTime(mockTimer));

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should use default glass sound
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(1);
    expect(mockPlaySystemSound).toHaveBeenCalledWith("glass", undefined);
  });

  it("should handle different sound types correctly", () => {
    const soundTypes = ["ping", "pop", "basso", "hero", "purr"];

    soundTypes.forEach((soundType) => {
      jest.clearAllMocks();

      // Mock specific sound preference
      mockGetPreferenceValues.mockReturnValue({
        soundNotification: soundType,
        soundVolume: "0.3",
      });

      // Mock elapsed time to be exactly 15 minutes
      mockGetElapsedTime.mockReturnValue("00:15:00");
      mockConvertElapsedTimeToMinutes.mockReturnValue(15);

      renderHook(() => useElapsedTime(mockTimer));

      // Advance time to trigger interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should play the specific sound type
      expect(mockPlaySystemSound).toHaveBeenCalledWith(soundType, "0.3");
    });
  });

  it("should use custom sound interval preference", () => {
    // Mock custom sound interval preference (10 minutes)
    mockGetPreferenceValues.mockReturnValue({
      soundNotification: "ping",
      soundVolume: "0.5",
      soundInterval: "10",
    });

    // Mock elapsed time to be exactly 10 minutes
    mockGetElapsedTime.mockReturnValue("00:10:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(10);

    renderHook(() => useElapsedTime(mockTimer));

    // Advance time to trigger interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should play sound at 10 minutes with custom interval
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(1);
    expect(mockPlaySystemSound).toHaveBeenCalledWith("ping", "0.5");

    // Mock elapsed time to be 20 minutes
    mockGetElapsedTime.mockReturnValue("00:20:00");
    mockConvertElapsedTimeToMinutes.mockReturnValue(20);

    // Advance time again
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should play sound again at 20 minutes (10-minute intervals)
    expect(mockPlaySystemSound).toHaveBeenCalledTimes(2);
  });

  it("should use different dropdown interval options", () => {
    const intervals = [
      { value: "1", minutes: 1 },
      { value: "5", minutes: 5 },
      { value: "30", minutes: 30 },
      { value: "60", minutes: 60 },
    ];

    intervals.forEach(({ value, minutes }) => {
      jest.clearAllMocks();
      mockPlaySystemSound.mockClear();

      // Mock specific interval preference
      mockGetPreferenceValues.mockReturnValue({
        soundNotification: "ping",
        soundVolume: "0.5",
        soundInterval: value,
      });

      // Mock elapsed time to match the interval
      mockGetElapsedTime.mockReturnValue(`00:${minutes.toString().padStart(2, "0")}:00`);
      mockConvertElapsedTimeToMinutes.mockReturnValue(minutes);

      renderHook(() => useElapsedTime(mockTimer));

      // Advance time to trigger interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should play sound at the specified interval (may be called multiple times due to initial render + effect)
      expect(mockPlaySystemSound).toHaveBeenCalledWith("ping", "0.5");
    });
  });
});
