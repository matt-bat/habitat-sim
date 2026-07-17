#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 /absolute/archive.tar.gz /absolute/new-or-empty-target" >&2
  exit 2
fi

archive="$1"
target="$2"
checksum="$archive.sha256"

if [[ "$archive" != /* || "$target" != /* || "$target" == "/" ]]; then
  echo "Archive and target must be absolute paths; target cannot be root." >&2
  exit 2
fi

if [[ ! -f "$archive" || ! -f "$checksum" ]]; then
  echo "Archive or adjacent checksum file is missing." >&2
  exit 2
fi

if [[ -d "$target" && -n "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  echo "Restore target must be empty." >&2
  exit 2
fi

sha256sum --check "$checksum"
mkdir -p "$target"
tar --no-same-owner --no-same-permissions -xzf "$archive" -C "$target"

for required in MVP.md docs/architecture.md user-instructions.md; do
  if [[ ! -f "$target/$required" ]]; then
    echo "Restore validation failed: missing $required" >&2
    exit 1
  fi
done

echo "Restore completed: $target"
