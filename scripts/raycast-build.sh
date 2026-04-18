#!/bin/bash
# Wrapper script for Raycast build that handles pnpm compatibility

echo "🏗️  Running Raycast build..."
echo "📝 Temporarily removing pnpm-lock.yaml for Raycast compatibility..."

if [ -f "pnpm-lock.yaml" ]; then
  mv pnpm-lock.yaml pnpm-lock.yaml.backup
  RAYCAST_BUILD_BACKUP=true
else
  RAYCAST_BUILD_BACKUP=false
fi

pnpm exec ray build "$@"

BUILD_RESULT=$?

if [ "$RAYCAST_BUILD_BACKUP" = true ]; then
  echo "📝 Restoring pnpm-lock.yaml..."
  mv pnpm-lock.yaml.backup pnpm-lock.yaml
fi

if [ $BUILD_RESULT -eq 0 ]; then
  echo "✅ Build complete"
else
  echo "❌ Build failed"
fi

exit $BUILD_RESULT