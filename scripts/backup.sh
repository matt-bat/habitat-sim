#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /absolute/backup/directory" >&2
  exit 2
fi

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
destination="$1"

if [[ "$destination" != /* || "$destination" == "/" || "$destination" == "$project_dir" || "$destination" == "$project_dir"/* ]]; then
  echo "Backup destination must be an absolute directory outside the project." >&2
  exit 2
fi

mkdir -p "$destination"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$destination/habitat-sim-$timestamp.tar.gz"

tar \
  --exclude='./node_modules' \
  --exclude='./dist' \
  --exclude='./test-results' \
  --exclude='./playwright-report' \
  --exclude='./*.tsbuildinfo' \
  --exclude='./.git' \
  -czf "$archive" \
  -C "$project_dir" .

sha256sum "$archive" > "$archive.sha256"
tar -tzf "$archive" >/dev/null

echo "Backup created: $archive"
echo "Checksum: $archive.sha256"
