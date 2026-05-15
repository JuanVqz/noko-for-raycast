#!/bin/bash
set -euo pipefail

pnpm exec ray build "$@"
