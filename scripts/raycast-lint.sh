#!/bin/bash
set -euo pipefail

# ray lint enforces npm-only lockfiles and rejects pnpm-lock.yaml.
# Run ESLint and Prettier directly instead.
if [[ "${1:-}" == "--fix" ]]; then
  yarn eslint src/ --fix
  yarn prettier --write .
else
  yarn eslint src/
  yarn prettier --check .
fi
