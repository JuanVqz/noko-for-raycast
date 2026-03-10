# Codebase Analysis & Improvement Plan

> **Last Updated**: March 2026
> **Purpose**: Document the current state of the codebase, identified issues, and planned improvements for future maintainability and performance.

---

## 📊 Current Codebase State

### Project Overview

- **Type**: Raycast Extension for Noko Time Tracking
- *Language*: TypeScript (strict mode)
- **React Version**: 19.x
- **Test Files**: 10 test files covering core functionality
- **Architecture**: Well-organized component structure with hooks, views, and utilities

### Dependencies Status

| Package          | Required | Installed | Status      |
| ---------------- | -------- | --------- | ----------- |
| `@raycast/api`   | ^1.104.7 | 1.104.4   | ⚠️ Mismatch |
| `@raycast/utils` | ^2.2.2   | 2.2.2     | ✅ OK       |
| `react`          | ^19.0.0  | 19.0.0    | ✅ OK       |
| `typescript`     | ^5.9.3   | 5.9.3     | ✅ OK       |

### Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── TimerItem.tsx     # Individual timer/project item
│   ├── EntryItem.tsx     # Individual entry display
│   ├── EntriesSummary.tsx # Daily and weekly time summaries
│   ├── ErrorBoundary.tsx # Error handling wrapper
│   ├── LoadingState.tsx  # Loading state component
│   ├── ProjectItem.tsx   # Project without timer
│   └── index.tsx         # Component exports
├── views/                # Screen/page components
│   ├── TimersView.tsx    # Main timers list view
│   ├── EntriesView.tsx   # Entries list with filtering
│   ├── AddEntryView.tsx  # Time entry creation form
│   └── index.tsx         # View exports
├── hooks/                # Custom React hooks
│   ├── useApiData.ts     # Data fetching with useFetch wrapper
│   ├── useTimerActions.ts # Timer control (start/pause/reset/log)
│   ├── useElapsedTime.ts # Real-time timer updates
│   ├── useEntrySubmission.ts # Entry form handling
│   ├── useEntries.ts     # Entry filtering logic
│   ├── useDetailToggle.ts # Detail view toggle
│   └── index.tsx         # Hook exports
├── lib/                  # Third-party integrations
│   └── api-client.ts     # Centralized API client
├── utils/                # Modular utility functions
│   ├── date-utils.ts     # Date manipulation
│   ├── time-utils.ts     # Time formatting
│   ├── entry-utils.ts    # Entry summary calculations
│   ├── description-utils.ts # Description formatting
│   ├── timer-utils.ts    # Timer-specific helpers
│   ├── toast-utils.ts    # Toast notification helpers
│   ├── user-utils.ts     # User-related helpers
│   └── index.tsx         # Utils exports
├── types.ts              # TypeScript type definitions
├── constants.ts          # Application constants
├── timers.tsx            # Main command entry point
└── __tests__/            # Test files
    ├── setup.ts          # Test configuration
    ├── api-client.test.ts
    ├── useTimerActions.test.ts
    └── ... (7 more)
```

---

## 🔴 Critical Issues

### 1. Dependency Version Mismatch

**Location**: `package.json` vs installed packages

**Issue**: `@raycast/api@1.104.4` is installed but `package.json` specifies `^1.104.7`. This can cause:

- Missing newer API features
- Potential runtime errors
- Inconsistent behavior across environments

**Fix**: Run `npm install` to resolve the version mismatch

### 2. Duplicate Type Definitions

**Location**:

- `src/types.ts` (line 104-108)
- `src/lib/api-client.ts` (line 6-10)

**Issue**: `ApiResponse<T>` type is defined in both files, causing:

- Potential inconsistency between definitions
- Confusion for developers
- Maintenance burden

**Fix**: Remove duplicate from `api-client.ts`, import from `types.ts`

### 3. Unused Ref in useElapsedTime

**Location**: `src/hooks/useElapsedTime.ts` (line 9)

**Issue**: `lastElapsedTimeRef` is set but never read

```typescript
const lastElapsedTimeRef = useRef<string | null>(null);
// Set but never used
setElapsedTime(initialElapsedTime);
lastElapsedTimeRef.current = initialElapsedTime; // Dead code
```

**Fix**: Remove the unused ref or implement its intended functionality

---

## 🟡 Performance Issues

### 1. No Request Cancellation

**Location**: `src/lib/api-client.ts`

**Issue**: API requests cannot be cancelled, leading to:

- Race conditions when rapid requests are made
- Memory leaks from pending requests
- Wasted network bandwidth

**Impact**: Medium - affects rapid user interactions

### 2. Inefficient Mutation Pattern

**Location**: `src/hooks/useTimerActions.ts`

**Issue**: Multiple `mutate()` calls after actions could be debounced

```typescript
const resetTimer = useCallback(async (project: ProjectType) => {
  const discardResult = await apiDiscardTimer(project);
  if (!discardResult.success) { /* handle error */ }

  const startResult = await apiStartTimer(project); // Sequential API calls
  // Could be optimized with parallel requests or better caching
}, [...]);
```

### 3. Timer Update Implementation

**Location**: `src/hooks/useElapsedTime.ts`

**Current**: Uses `setInterval` with 1-second intervals
**Alternative**: Could use `requestAnimationFrame` for smoother updates

---

## 🟢 TypeScript Improvements

### 1. Missing Type Exports

**Location**: `src/types.ts`

**Issue**: Some internal types not exported for external use:

- `ApprovedByType` - used internally but not exported
- Some utility types could be more explicit

### 2. No Branded Types

**Current**:

```typescript
type ProjectId = string;
type TimerId = string;
```

**Better**:

```typescript
type ProjectId = string & { readonly __brand: unique symbol };
type TimerId = string & { readonly __brand: unique symbol };
```

### 3. Limited Use of Utility Types

Could leverage more TypeScript utility types:

- `Pick<T, K>` for selecting specific properties
- `Omit<T, K>` for excluding properties
- `Partial<T>` for optional properties
- `Required<T>` for mandatory properties

---

## 🔵 Code Quality Observations

### Strengths ✅

1. **Good Component Organization**: Clear separation between components, views, and hooks
2. **Proper Memoization**: Uses `memo`, `useMemo`, `useCallback` appropriately
3. **Error Handling**: Error boundaries in place, toast notifications for errors
4. **TypeScript Strict Mode**: Enabled and enforced
5. **Consistent Naming**: Follows project conventions (PascalCase components, camelCase hooks)
6. **Test Coverage**: Core functionality has tests

### Areas for Improvement ⚠️

1. **Magic Strings**: Some hardcoded strings remain in components
2. **Inconsistent Error Handling**: Mixed patterns across hooks
3. **Form State Management**: Could use more explicit form states
4. **Constants Usage**: Some values should be moved to constants

---

## 📋 Improvement Phases

### Phase 1: Critical Fixes (Immediate)

| Priority | Item                              | Effort | Impact |
| -------- | --------------------------------- | ------ | ------ |
| P0       | Fix dependency mismatch           | Low    | High   |
| P0       | Remove duplicate ApiResponse type | Low    | Medium |
| P0       | Fix unused ref                    | Low    | Low    |

### Phase 2: Type Safety (Short-term)

| Priority | Item                 | Effort | Impact |
| -------- | -------------------- | ------ | ------ |
| P1       | Add branded types    | Low    | High   |
| P1       | Add type guards      | Medium | Medium |
| P1       | Export missing types | Low    | Medium |

### Phase 3: Performance (Medium-term)

| Priority | Item                     | Effort | Impact |
| -------- | ------------------------ | ------ | ------ |
| P1       | Add request cancellation | Medium | High   |
| P1       | Implement debouncing     | Medium | Medium |
| P2       | Timer RAF optimization   | Medium | Low    |

### Phase 4: Architecture (Long-term)

| Priority | Item                  | Effort | Impact |
| -------- | --------------------- | ------ | ------ |
| P2       | Extract service layer | High   | Medium |
| P2       | Custom error classes  | Medium | Medium |
| P2       | Add integration tests | High   | High   |

---

## 🎯 Recommendations Summary

### Immediate Actions

1. Run `npm install` to fix dependency versions
2. Remove duplicate `ApiResponse` type definition
3. Fix or remove unused `lastElapsedTimeRef`

### Short-term Improvements

1. Add branded types for IDs (ProjectId, TimerId, etc.)
2. Create type guard utilities
3. Add request cancellation to API client

### Long-term Goals

1. Extract business logic into service classes
2. Implement comprehensive integration tests
3. Add performance monitoring

---

## 📚 Related Documentation

- [Development Guide](development.md) - Setting up development environment
- [API Reference](API.md) - Detailed API integration docs
- [Architecture](ARCHITECTURE.md) - Design patterns and component hierarchy
- [Performance](PERFORMANCE.md) - Performance optimization guidelines
