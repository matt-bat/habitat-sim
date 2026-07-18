# Expert-Iteration Restore Drill — 2026-07-17

## Scope

Critical recovery verification for the six-expert scientific and interface iteration.

## Backup

- Archive: `/tmp/habitat-sim-expert-iteration-backups/habitat-sim-20260717T182525Z.tar.gz`
- Checksum: adjacent `.sha256` file
- Exclusions: Git metadata, dependencies, build output, browser reports, test output, and TypeScript incremental artifacts
- Archive listing: pass during backup creation

## Restore

- Target: `/tmp/habitat-sim-expert-final-restore-20260717T182525Z`
- SHA-256 verification: pass
- Empty-target extraction: pass
- Required-artifact check: pass for MVP, architecture, and instruction tracker
- Clean `npm ci`: pass; 60 packages audited, zero known vulnerabilities
- Restored `npm run check`: pass
  - strict TypeScript: pass
  - Vitest: 14/14 pass
  - optimized Vite build: pass

## Recovery Objectives

- Recovery point: the documentation-complete post-change workspace at `2026-07-17T18:25:25Z`
- Recovery time observed: under one minute locally, excluding external package-registry latency
- Recovery method: verify checksum, extract to a new empty directory, install from lockfile, run the complete check

## Decision

Pass. The archive is independently restorable and reproduces the validated production source state. The rollback path is either this archive or a file-scoped Git revert after the iteration is committed.
