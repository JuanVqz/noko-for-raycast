# AGENTS.md

This file contains development guidelines for agentic coding assistants working on this Raycast Noko extension.

## Build & Development Commands

```bash
# Development
npm run dev           # Start Raycast development mode
npm run build         # Build extension for production

# Linting & Formatting
npm run lint          # Run ESLint
npm run fix-lint      # Auto-fix linting issues

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Single Test Execution
npm test -- useApiData.test.ts           # Run specific test file
npm test -- -t "should fetch timers"     # Run tests matching pattern
```

## TypeScript Configuration

- Strict mode enabled (no implicit any, null checks, etc.)
- Target: ES2022, Module: CommonJS
- JSX: react-jsx automatic runtime

## Code Style Guidelines

### File Organization

```
src/
├── components/       # Reusable UI components (.tsx)
├── views/            # Screen/page components (.tsx)
├── hooks/            # Custom React hooks (.ts)
├── lib/              # Third-party integrations (.ts)
├── __tests__/        # Test files (.test.ts, .test.tsx)
├── __tests__/__mocks__/ # Mock files
├── types.ts          # Type definitions
├── constants.ts      # Application constants
└── utils.ts          # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (`TimerItem`, `TimersView`)
- **Hooks**: camelCase with `use` prefix (`useApiData`, `useTimers`)
- **Types/Interfaces**: PascalCase with descriptive suffix or `I` prefix (`TimerType`, `IPreferences`)
- **Enums**: PascalCase with `Enum` suffix (`TimerStateEnum`, `EntryDateEnum`)
- **Functions/Methods**: camelCase, descriptive (`formatTime`, `getElapsedTime`)
- **Constants**: UPPER_SNAKE_CASE (`TIMER_STATE_PRIORITIES`)

### Import Style

```typescript
// Third-party imports first
import { List, Icon } from "@raycast/api";
import { useCallback, useMemo } from "react";

// Local imports grouped by type
import { TimerType, TimerStateEnum } from "../types";
import { useTimerActions } from "../hooks/useTimerActions";
import { formatTime } from "../utils";
```

### Component Patterns

- Use functional components with hooks
- Define interfaces for props at top of file
- Use `memo` for performance optimization when possible
- Set `displayName` on memoized components
- Destructure props in function signature

```typescript
interface TimerItemProps {
  timer: TimerType;
  onTimerChange?: () => void;
}

const TimerItem = memo<TimerItemProps>(({ timer, onTimerChange }) => {
  // Component logic
});

TimerItem.displayName = "TimerItem";
```

### Hook Patterns

- Accept options interface as parameter
- Use `useCallback` for event handlers
- Return consistent structure: `{ data, isLoading, mutate, ...rest }`
- Handle errors gracefully with toast notifications

```typescript
interface UseTimerActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useTimerActions = (options: UseTimerActionsOptions = {}) => {
  const handleAction = useCallback(async () => {
    // Implementation
  }, [options]);

  return { startTimer, pauseTimer };
};
```

### Type Definitions

- Centralize types in `types.ts`
- Use `type` for simple aliases, `interface` for object shapes
- Group related types with comment separators
- Export types at bottom of file

### Error Handling

- Return `ApiResponse<T>` wrapper with `{ success, error?, data? }`
- Wrap API calls in try-catch blocks
- Show user-friendly toast notifications for errors
- Use optional chaining and nullish coalescing for safe access

```typescript
const errorMessage = error instanceof Error ? error.message : "Unknown error";
showErrorToast("Operation Failed", errorMessage);
```

### Testing Guidelines

- Place tests in `src/__tests__/` with `.test.ts` or `.test.tsx` extension
- Use `describe`/`it` pattern for test organization
- Mock external dependencies in `__mocks__/` directory
- Use `act` for async operations in hooks
- Clear mocks in `beforeEach`

```typescript
describe("useTimerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start timer successfully", async () => {
    // Test implementation
  });
});
```

### Constants & Configuration

- Store magic strings/numbers in `constants.ts`
- Group related constants with comment separators
- Export constants grouped by functionality

### Code Organization within Files

- Use comment section headers (e.g., `// === TIMER TYPES ===`)
- Group related functions together
- Export related functions/names at bottom of file
- Keep functions focused and single-responsibility

### API Integration

- Centralize API calls in `lib/api-client.ts`
- Use typed responses with `ApiResponse<T>`
- Handle empty responses (common for DELETE operations)
- Include proper headers including authentication

### React Performance

- Use `useMemo` for expensive computations
- Use `useCallback` for functions passed to child components
- Memoize list items when rendering large lists
- Avoid inline function definitions in JSX

### Formatting

- Follow Prettier defaults (uses `.prettierrc`)
- ESLint extends `@raycast` config
- Use 2 spaces for indentation
- Use double quotes for strings

### Commit Messages

- Use `npm run commit` for conventional commits
- Follow format: `type(scope): description`
- Types: feat, fix, docs, refactor, test, chore

### Git Workflow

- This repository uses **release-please** for automated versioning and release management
- Commit changes with conventional commit format - release-please will automatically create releases
- Do NOT use `git commit -m` directly unless you know what you're doing
- Use `npm run commit` for interactive commit message generation
- Release types are determined by commit message: `feat:` = minor bump, `fix:` = patch bump, `BREAKING CHANGE:` = major bump
- View recent commits: `git log --oneline -10`
- When asked to commit, follow these steps:
  1. Run `git status` to check for untracked files
  2. Run `git diff` to see staged and unstaged changes
  3. Analyze changes and draft appropriate commit message
  4. Run `git add` to stage relevant files
  5. Run `git commit` with descriptive message
  6. Run `git status` after commit to verify success
- Never run: `git commit --amend` unless explicitly requested AND HEAD commit was created in this conversation AND not pushed to remote
- Never force push to main/master
- Always skip hooks only if user explicitly requests

### Key Dependencies

- [`@raycast/api`](https://developers.raycast.com/api-reference) - Raycast UI components and utilities
- [`@raycast/utils`](https://www.npmjs.com/package/@raycast/utils) - React hooks (`useFetch`, `useFetch` with caching)
- [`react`](https://react.dev/) - Component framework
- [`typescript`](https://www.typescriptlang.org/) - Type safety
- [`jest`](https://jestjs.io/) - Testing framework
- [`@types/react`](https://www.npmjs.com/package/@types/react) - React type definitions
- [`@types/node`](https://www.npmjs.com/package/@types/node) - Node.js type definitions
- [`eslint`](https://eslint.org/) - Code linting
- [`prettier`](https://prettier.io/) - Code formatting
