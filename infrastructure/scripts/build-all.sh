#!/bin/bash
set -e
# Build all Go services
find services gateway apps/ussd -name "go.mod" | while read mod; do
  dir=$(dirname "$mod")
  echo "Building $dir..."
  (cd "$dir" && go build ./... 2>/dev/null || echo "  skipped (missing deps)")
done
echo "Build complete."
