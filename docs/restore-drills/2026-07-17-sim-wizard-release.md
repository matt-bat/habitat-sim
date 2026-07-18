# Sim Wizard 1.1.0 Restore Drill — 2026-07-17

## Scope

Critical recovery verification for the stacked-review, scenario-catalog, Sim Wizard, responsive-interface, and GitHub Pages release candidate.

## Backup

- Archive: `/tmp/habitat-sim-wizard-release-backups/habitat-sim-20260718T005119Z.tar.gz`
- Checksum: adjacent `.sha256` file
- Exclusions: Git metadata, dependencies, build output, browser reports, test output, and TypeScript incremental artifacts
- Archive listing: pass during backup creation

## Restore

- Target: `/tmp/habitat-sim-wizard-release-restore-20260718T005119Z`
- SHA-256 verification: pass
- Empty-target extraction: pass
- Required-artifact check: pass for MVP, architecture, and instruction tracker
- Clean `npm ci`: pass; 60 packages audited, zero known vulnerabilities
- Restored `npm run check`: pass
  - strict TypeScript: pass
  - Vitest: 27/27 pass across four files
  - optimized root-base Vite build: pass
  - JavaScript: 107.26 kilobytes gzip
  - CSS: 14.09 kilobytes gzip
- Restored `npm run build:pages`: pass with `/habitat-sim/` repository base
- Source parity: SHA-256 hashes match for the lockfile, engine, scenario catalog, Sim Wizard, and license

## Recovery Objectives

- Recovery point: the locally validated, documentation-synchronized 1.1.0 release candidate at `2026-07-18T00:51:19Z`
- Recovery time observed: under one minute locally, excluding external package-registry latency
- Recovery method: verify checksum, extract into a new empty directory, install only from the lockfile, run strict/unit/build checks, then produce the Pages-form build

## Rollback

Before publication, restore this archive into a new directory. After publication, either deploy the last successful Pages artifact, revert the release commit with a new Git commit, or restore this archive and push the reconstructed source. No server-side data migration is involved because all application data remains browser-local.

## Decision

Pass. The archive independently reproduces the validated source, test results, root production build, and repository-subpath Pages build. Public deployment remains the only release gate not exercised by this drill.
