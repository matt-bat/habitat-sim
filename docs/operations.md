# Local Operations

## Release Scope

The source is published at `https://github.com/matt-bat/habitat-sim`. The application remains a client-only browser build with no hosted runtime, accounts, database, or external service dependency.

## Verification Ownership

The model runs unit, build, browser, audit, and recovery checks for production releases. Pull requests and pushes to `main` run the same quality and browser layers through GitHub Actions.

## Backup Policy

- Compliance state: `script_only` for the source repository; GitHub provides an additional off-machine Git copy after publication.
- Protected assets: source, tests, configuration, documentation, and lockfile.
- Excluded reconstructable assets: `node_modules`, `dist`, test output, local backups, and Git metadata.
- Recovery point objective: 24 hours during active work.
- Recovery time objective: 4 hours.
- Retention recommendation: 7 daily, 4 weekly, and 6 monthly archives outside the project directory.

## Backup

```sh
bash scripts/backup.sh /absolute/path/to/backup-directory
```

The script writes a timestamped archive and SHA-256 checksum.

## Restore

```sh
bash scripts/restore.sh /absolute/path/to/archive.tar.gz /absolute/path/to/new-empty-target
```

Restore refuses a non-empty target, verifies the adjacent checksum, and avoids replaying synthetic WSL/Windows ownership metadata during extraction.

## Restore Drill

The initial technical full drill passed on 2026-07-17 after a WSL ownership portability fix. Run quarterly thereafter and record evidence in `docs/restore-drills/`.
