# Improvement Plan Details

> **Last Updated**: March 2026
> **Purpose**: Detailed technical specifications for implementing improvements to the codebase.

---

## Table of Contents

1. [Type System Enhancements](#1-type-system-enhancements)
2. [Performance Optimizations](#2-performance-optimizations)
3. [Raycast Best Practices](#3-raycast-best-practices)
4. [Code Quality Improvements](#4-code-quality-improvements)
5. [Testing Strategy](#5-testing-strategy)

---

## 1. Type System Enhancements

### 1.1 Branded Types for IDs

Create stronger type safety for IDs that prevent mixing up different ID types.

```typescript
// src/types.ts additions

// Branded types prevent mixing string IDs
type ProjectId = string & { readonly __brand: unique symbol };
type TimerId = string & { readonly __brand: unique symbol };
type EntryId = string & { readonly __brand: unique symbol };
type UserId = string & { readonly __brand: unique symbol };
type TagId = string & { readonly __brand: unique symbol };

// Type guards for runtime validation
export const isProjectId = (id: string): id is ProjectId => {
  return id.startsWith("project-");
};

export const isTimerId = (id: string): id is TimerId => {
  return id.startsWith("timer-");
};

// Helper functions to create branded IDs
export const createProjectId = (id: string): ProjectId => id as ProjectId;
export const createTimerId = (id: string): TimerId => id as TimerId;
export const createEntryId = (id: string): EntryId => id as EntryId;
```

### 1.2 Type Guards

Add runtime type validation for safer data handling.

```typescript
// src/utils/type-guards.ts (new file)

import { TimerType, EntryType, ProjectType, TimerStateEnum } from "../types";

export const isValidTimerState = (state: unknown): state is TimerStateEnum => {
  return state === TimerStateEnum.Running || state === TimerStateEnum.Paused;
};

export const isTimerType = (data: unknown): data is TimerType => {
  if (typeof data !== "object" || data === null) return false;
  const timer = data as Record<string, unknown>;
  return (
    typeof timer.id === "string" &&
    typeof timer.state === "string" &&
    isValidTimerState(timer.state)
  );
};

export const isEntryType = (data: unknown): data is EntryType => {
  if (typeof data !== "object" || data === null) return false;
  const entry = data as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.minutes === "number" &&
    typeof entry.date === "string"
  );
};

export const isProjectType = (data: unknown): data is ProjectType => {
  if (typeof data !== "object" || data === null) return false;
  const project = data as Record<string, unknown>;
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.color === "string"
  );
};
```

### 1.3 Discriminated Unions for Form States

Better type safety for form handling.

```typescript
// src/types.ts additions

export type TimerFormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; error: string };

export type EntryFormState = {
  project: ProjectType | null;
  minutes: string;
  description: string;
  tags: string[];
  date: Date;
  timerState: TimerFormState;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
```

### 1.4 Utility Types

```typescript
// src/types.ts additions

// Extract specific API response types
export type TimerResponse = TimerType[];
export type ProjectResponse = ProjectType[];
export type EntryResponse = EntryType[];
export type TagResponse = TagType[];

// Deep partial for nested updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Timer URL types using template literals
export type TimerUrlType =
  | "url"
  | "start_url"
  | "pause_url"
  | "add_or_subtract_time_url"
  | "log_url"
  | "log_inbox_entry_url";

export type TimerUrls = {
  [K in TimerUrlType]: string;
};
```

---

## 2. Performance Optimizations

### 2.1 API Request Cancellation

Add AbortController support to prevent race conditions.

```typescript
// src/lib/api-client.ts improvements

class ApiClient {
  private abortControllers: Map<string, AbortController> = new Map();

  private getKey(method: string, endpoint: string): string {
    return `${method}:${endpoint}`;
  }

  private cancelPreviousRequest(method: string, endpoint: string): void {
    const key = this.getKey(method, endpoint);
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    this.cancelPreviousRequest("GET", endpoint);

    const controller = new AbortController();
    const key = this.getKey("GET", endpoint);
    this.abortControllers.set(key, controller);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: this.headers,
        signal: controller.signal,
      });

      this.abortControllers.delete(key);
      return this.parseResponse<T>(response);
    } catch (error) {
      this.abortControllers.delete(key);

      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, error: "Request cancelled" };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Clean up all pending requests
  cancelAllRequests(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}
```

### 2.2 Debounced Mutations

Reduce API calls during rapid user interactions.

```typescript
// src/hooks/useApiData.ts improvements

import { useFetch, useDebounce } from "@raycast/utils";
import { useMemo, useCallback, useRef } from "react";

export const useTimers = () => {
  const {
    data: apiTimers,
    isLoading,
    mutate,
    ...rest
  } = useApiData<TimerType[]>("/timers");

  // Debounce mutations to prevent rapid consecutive API calls
  const debouncedMutate = useDebounce(mutate, 300);

  // Track last mutation time to prevent debounce spam
  const lastMutateTime = useRef<number>(0);

  const optimizedMutate = useCallback(() => {
    const now = Date.now();
    if (now - lastMutateTime.current > 200) {
      lastMutateTime.current = now;
      mutate();
    } else {
      debouncedMutate();
    }
  }, [mutate, debouncedMutate]);

  const timers = useMemo(() => {
    if (!apiTimers) return [];

    return [...apiTimers].sort((a, b) => {
      const priorityA = getTimerStatePriority(a.state);
      const priorityB = getTimerStatePriority(b.state);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return a.project.name.localeCompare(b.project.name);
    });
  }, [apiTimers]);

  return {
    data: timers,
    isLoading,
    mutate: optimizedMutate,
    ...rest,
  };
};
```

### 2.3 Timer Performance with requestAnimationFrame

```typescript
// src/hooks/useElapsedTime.ts improvements

import { useState, useEffect, useRef, useCallback } from "react";
import { TimerType, TimerStateEnum } from "../types";
import { getElapsedTime } from "../utils";

const useElapsedTime = (timer: TimerType) => {
  const [elapsedTime, setElapsedTime] = useState<string>("0:00:00");
  const fetchTimeRef = useRef(new Date());
  const requestRef = useRef<number>();
  const previousTimerRef = useRef<string>("");

  const updateTimer = useCallback(() => {
    const newElapsedTime = getElapsedTime(
      timer,
      new Date(),
      fetchTimeRef.current,
    );
    setElapsedTime(newElapsedTime);

    // Continue updating if timer is still running
    if (timer.state === TimerStateEnum.Running) {
      requestRef.current = requestAnimationFrame(updateTimer);
    }
  }, [timer]);

  useEffect(() => {
    // Only reset if timer ID changed (new timer)
    if (timer.id !== previousTimerRef.current) {
      previousTimerRef.current = timer.id;
      fetchTimeRef.current = new Date();

      // Cancel any existing animation frame
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      // Calculate initial elapsed time
      const initialElapsedTime = getElapsedTime(
        timer,
        new Date(),
        fetchTimeRef.current,
      );
      setElapsedTime(initialElapsedTime);
    }

    // Set up or continue animation frame for running timers
    if (timer.state === TimerStateEnum.Running) {
      requestRef.current = requestAnimationFrame(updateTimer);
    }

    // Cleanup on unmount or timer change
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [timer.state, timer.id, updateTimer]);

  return elapsedTime;
};

export default useElapsedTime;
```

---

## 3. Raycast Best Practices

### 3.1 Enhanced Toast Handling

```typescript
// src/utils/toast-utils.ts improvements

import { showToast, Toast } from "@raycast/api";

type ToastOptions = {
  title: string;
  message?: string;
  style?: Toast.Style;
  duration?: number;
};

const DEFAULT_DURATION = 3000;

export const showSuccessToast = async (
  title: string,
  message?: string,
  options?: Partial<ToastOptions>,
): Promise<void> => {
  await showToast({
    style: Toast.Style.Success,
    title,
    message,
    ...options,
  });
};

export const showErrorToast = async (
  title: string,
  message?: string,
  options?: Partial<ToastOptions>,
): Promise<void> => {
  await showToast({
    style: Toast.Style.Failure,
    title,
    message,
    ...options,
  });
};

export const showInfoToast = async (
  title: string,
  message?: string,
  options?: Partial<ToastOptions>,
): Promise<void> => {
  await showToast({
    style: Toast.Style.Info,
    title,
    message,
    ...options,
  });
};

// Convenience methods for common operations
export const showApiErrorToast = (operation: string, error: string) => {
  return showErrorToast(`${operation} Failed`, error);
};

export const showApiSuccessToast = (operation: string, details?: string) => {
  return showSuccessToast(`${operation} Successful`, details);
};
```

### 3.2 Keyboard Shortcuts Standardization

Use Raycast's standard keyboard shortcuts for consistency.

```typescript
// Recommended shortcuts from Raycast guidelines:
// - Cmd+N: New item
// - Cmd+Enter: Submit/Save
// - Cmd+.: Pause/Stop
// - Cmd+[: Back
// - Cmd+]: Forward
// - Cmd+Shift+Enter: Cancel/Close
// - Cmd+D: Toggle detail
// - Cmd+Shift+C: Copy
// - Cmd+Shift+E: Edit
// - Delete: Remove/Delete
```

### 3.3 Using Raycast Cache for Persistent State

```typescript
// Example: Caching selected project
import { Cache } from "@raycast/api";

const projectCache = new Cache({
  name: "selected-project",
});

export const saveSelectedProject = (project: ProjectType): void => {
  projectCache.set("current", JSON.stringify(project));
};

export const getSelectedProject = (): ProjectType | null => {
  const data = projectCache.get("current");
  return data ? JSON.parse(data) : null;
};

export const clearSelectedProject = (): void => {
  projectCache.remove("current");
};
```

---

## 4. Code Quality Improvements

### 4.1 Custom Error Classes

```typescript
// src/utils/errors.ts (new file)

export class TimerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly projectId?: string,
  ) {
    super(message);
    this.name = "TimerError";
  }
}

export class EntryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly entryId?: string,
  ) {
    super(message);
    this.name = "EntryError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// Error codes enum
export enum ErrorCode {
  TIMER_NOT_FOUND = "TIMER_NOT_FOUND",
  TIMER_ALREADY_RUNNING = "TIMER_ALREADY_RUNNING",
  TIMER_NOT_RUNNING = "TIMER_NOT_RUNNING",
  INVALID_TIME_FORMAT = "INVALID_TIME_FORMAT",
  PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMITED = "RATE_LIMITED",
}
```

### 4.2 Constants Consolidation

```typescript
// src/constants.ts improvements

// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://api.nokotime.com/v2",
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// Timer Configuration
export const TIMER_CONFIG = {
  UPDATE_INTERVAL: 1000,
  MAX_DISPLAY_SECONDS: 86399,
  DEBOUNCE_DELAY: 300,
  STATE_TRANSITIONS: {
    IDLE: ["start"],
    RUNNING: ["pause", "log", "discard"],
    PAUSED: ["resume", "log", "discard"],
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
  MAX_TAG_DISPLAY: 5,
} as const;

// Form Configuration
export const FORM_CONFIG = {
  DEFAULT_TIME_INCREMENT: 15,
  DEFAULT_TIME_FORMAT: "0:15",
  DEFAULT_MINUTES: 15,
  TIME_INPUT_REGEX: /^(\d{1,2}):(\d{2})$|^\d+$/,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  TIMERS: "/timers",
  PROJECTS: "/projects",
  PROJECTS_TIMER: (id: string) => `/projects/${id}/timer`,
  PROJECTS_TIMER_START: (id: string) => `/projects/${id}/timer/start`,
  PROJECTS_TIMER_PAUSE: (id: string) => `/projects/${id}/timer/pause`,
  PROJECTS_TIMER_LOG: (id: string) => `/projects/${id}/timer/log`,
  ENTRIES: "/entries",
  USER_ENTRIES: "/current_user/entries",
  TAGS: "/tags",
} as const;
```

### 4.3 Service Layer Pattern

```typescript
// src/lib/timer-service.ts (new file)

import { apiClient } from "./api-client";
import { TimerType, EntryType, EntryFormData } from "../types";
import {
  parseTimeInput,
  combineDescriptionAndTags,
  dateOnTimezone,
} from "../utils";
import { TimerError, ErrorCode } from "../utils/errors";

export class TimerService {
  async startTimer(projectId: string): Promise<TimerType> {
    const result = await apiClient.put<TimerType>(
      `/projects/${projectId}/timer/start`,
    );

    if (!result.success || !result.data) {
      throw new TimerError(
        result.error || "Failed to start timer",
        ErrorCode.TIMER_ALREADY_RUNNING,
        projectId,
      );
    }

    return result.data;
  }

  async pauseTimer(projectId: string): Promise<TimerType> {
    const result = await apiClient.put<TimerType>(
      `/projects/${projectId}/timer/pause`,
    );

    if (!result.success || !result.data) {
      throw new TimerError(
        result.error || "Failed to pause timer",
        ErrorCode.TIMER_NOT_RUNNING,
        projectId,
      );
    }

    return result.data;
  }

  async resetTimer(projectId: string): Promise<TimerType> {
    // Discard current timer first
    await this.discardTimer(projectId);
    // Then start fresh
    return this.startTimer(projectId);
  }

  async discardTimer(projectId: string): Promise<void> {
    const result = await apiClient.delete(`/projects/${projectId}/timer`);

    if (!result.success) {
      throw new TimerError(
        result.error || "Failed to discard timer",
        ErrorCode.TIMER_NOT_FOUND,
        projectId,
      );
    }
  }

  async logTimer(
    projectId: string,
    entryData: EntryFormData,
  ): Promise<EntryType> {
    const payload = {
      minutes: parseTimeInput(entryData.minutes),
      description: combineDescriptionAndTags(
        entryData.description,
        entryData.tags,
      ),
      entry_date: dateOnTimezone(entryData.date),
    };

    const result = await apiClient.put<EntryType>(
      `/projects/${projectId}/timer/log`,
      payload,
    );

    if (!result.success || !result.data) {
      throw new TimerError(
        result.error || "Failed to log timer",
        ErrorCode.INVALID_TIME_FORMAT,
        projectId,
      );
    }

    return result.data;
  }
}

export const timerService = new TimerService();
```

---

## 5. Testing Strategy

### 5.1 Test Utilities

```typescript
// src/__tests__/utils/test-utils.tsx (new file)

import { ReactNode } from "react";
import { renderHook, RenderHookOptions } from "@testing-library/react";
import {
  TimerType,
  ProjectType,
  EntryType,
  UserType,
  TagType,
} from "../../types";
import { TimerStateEnum } from "../../types";

// Mock data factories
export const mockUser = (overrides?: Partial<UserType>): UserType => ({
  id: "user-1",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  profile_image_url: "https://example.com/avatar.png",
  ...overrides,
});

export const mockProject = (overrides?: Partial<ProjectType>): ProjectType => ({
  id: "project-1",
  name: "Test Project",
  color: "#FF5733",
  enabled: true,
  billing_increment: 15,
  ...overrides,
});

export const mockTimer = (overrides?: Partial<TimerType>): TimerType => ({
  id: "timer-1",
  state: TimerStateEnum.Running,
  date: "2024-01-01",
  seconds: 3600,
  formatted_time: "1:00:00",
  description: "Test timer",
  user: mockUser(),
  project: mockProject(),
  url: "https://api.nokotime.com/v2/timers/1",
  start_url: "https://api.nokotime.com/v2/projects/1/timer/start",
  pause_url: "https://api.nokotime.com/v2/projects/1/timer/pause",
  add_or_subtract_time_url: "https://api.nokotime.com/v2/projects/1/timer",
  log_url: "https://api.nokotime.com/v2/projects/1/timer/log",
  log_inbox_entry_url: "https://api.nokotime.com/v2/entries",
  ...overrides,
});

export const mockEntry = (overrides?: Partial<EntryType>): EntryType => ({
  id: "entry-1",
  date: "2024-01-01",
  billable: true,
  minutes: 60,
  formatted_minutes: "01:00",
  description: "Test entry",
  approved_by: null,
  approved_at: "",
  user: mockUser(),
  tags: [],
  project: mockProject(),
  ...overrides,
});

export const mockTag = (overrides?: Partial<TagType>): TagType => ({
  id: "tag-1",
  name: "test-tag",
  formatted_name: "Test Tag",
  ...overrides,
});

// Custom render with providers
export const renderWithProviders = (
  component: ReactNode,
  options?: RenderHookOptions<unknown>,
) => {
  return {
    ...renderHook(() => component, options),
  };
};

// Wait helper for async assertions
export const waitForTimerState = async (
  getTimer: () => TimerType,
  state: TimerStateEnum,
  timeout = 5000,
): Promise<void> => {
  const startTime = Date.now();

  while (getTimer().state !== state) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for timer state: ${state}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};
```

### 5.2 Integration Test Example

```typescript
// src/__tests__/integration/timer-workflow.test.ts (new file)

import { renderHook, act, waitFor } from "@testing-library/react";
import { TimerStateEnum } from "../../types";
import { useTimers } from "../../hooks/useApiData";
import { useTimerActions } from "../../hooks/useTimerActions";
import { mockProject, mockTimer } from "../utils/test-utils";

jest.mock("@raycast/api");
jest.mock("../lib/api-client");

describe("Timer Workflow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should complete full timer lifecycle", async () => {
    const mockApiTimer = mockTimer({ state: TimerStateEnum.Running });

    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify([mockApiTimer])),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        text: () => Promise.resolve(JSON.stringify({})),
      });

    // Start with timers
    const { result: timersResult } = renderHook(() => useTimers());

    await waitFor(() => {
      expect(timersResult.current.data).toBeDefined();
    });

    const project = mockProject();

    // Get timer actions
    const { result: actionsResult } = renderHook(() => useTimerActions());

    // Start timer
    await act(async () => {
      await actionsResult.current.startTimer(project);
    });

    // Verify success toast was called
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        style: Toast.Style.Success,
        title: "Timer Started",
      }),
    );
  });

  it("should handle timer errors gracefully", async () => {
    const project = mockProject();

    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => "application/json" },
      text: () => Promise.resolve("Project not found"),
    });

    const { result } = renderHook(() => useTimerActions());

    await act(async () => {
      await result.current.startTimer(project);
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        style: Toast.Style.Failure,
        title: "Failed to Start Timer",
      }),
    );
  });
});
```

### 5.3 Performance Test Example

```typescript
// src/__tests__/performance/timer-rendering.test.ts (new file)

import { renderHook, act } from "@testing-library/react";
import { useTimers } from "../../hooks/useApiData";
import { mockTimer } from "../utils/test-utils";

describe("Performance Tests", () => {
  it("should sort 100 timers efficiently", () => {
    const timers = Array.from({ length: 100 }, (_, i) =>
      mockTimer({
        id: `timer-${i}`,
        project: {
          ...mockProject(),
          name: `Project ${String.fromCharCode(65 + (i % 26))}`,
        },
      }),
    );

    const startTime = performance.now();

    // Simulate sorting
    const sorted = [...timers].sort((a, b) => {
      const priorityA = a.state === "running" ? 1 : 2;
      const priorityB = b.state === "running" ? 1 : 2;

      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.project.name.localeCompare(b.project.name);
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10); // Should complete in under 10ms
    expect(sorted.length).toBe(100);
  });

  it("should handle rapid state changes without memory leaks", () => {
    const { result, unmount } = renderHook(() => useTimers());

    // Simulate rapid updates
    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.mutate?.();
      });
    }

    // Should complete without errors
    expect(() => unmount()).not.toThrow();
  });
});
```

---

## 📚 Related Documentation

- [Codebase Analysis](CODEBASE_ANALYSIS.md) - Current state and issues
- [API Reference](API.md) - Technical API documentation
