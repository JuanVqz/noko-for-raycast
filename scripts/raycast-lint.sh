#!/bin/bash
# Wrapper script for Raycast lint that handles pnpm compatibility

echo "🔍 Running Raycast lint..."
echo "📝 Temporarily removing pnpm-lock.yaml for Raycast compatibility..."

if [ -f "pnpm-lock.yaml" ]; then
  mv pnpm-lock.yaml pnpm-lock.yaml.backup
  RAYCAST_LINT_BACKUP=true
else
  RAYCAST_LINT_BACKUP=false
fi

pnpm exec ray lint "$@"

if [ "$RAYCAST_LINT_BACKUP" = true ]; then
  echo "📝 Restoring pnpm-lock.yaml..."
  mv pnpm-lock.yaml.backup pnpm-lock.yaml
fi

echo "✅ Lint complete"