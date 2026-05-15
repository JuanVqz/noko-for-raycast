#!/bin/bash
set -euo pipefail

# ray lint enforces npm-only lockfiles and rejects pnpm-lock.yaml.
# Run ESLint and Prettier directly instead.
if [[ "${1:-}" == "--fix" ]]; then
  pnpm exec eslint src/ --fix
  pnpm exec prettier --write .
else
  pnpm exec eslint src/
  pnpm exec prettier --check .
fi
