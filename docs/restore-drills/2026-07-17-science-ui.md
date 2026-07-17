# Science and Observatory Restore Drill — 2026-07-17

## Scope

Post-change recovery verification for the scientific-integrity and observatory-interface iteration.

## Artifact

- Fully tested archive: `/tmp/habitat-sim-production-backups/habitat-sim-20260717T162446Z.tar.gz`
- Fully tested SHA-256: `b4827efa66005d42ba57a93d82a2ec1c2fb929c81aa9047464ab406002b43b53`
- Fully tested restore target: `/tmp/habitat-sim-restore-20260717T162446Z`
- Final documentation-complete archive: `/tmp/habitat-sim-production-backups/habitat-sim-20260717T162717Z.tar.gz`
- Final SHA-256: `9dc716b9db3496b8bae12df97b5f2005ae5f085f0b92d461db8dcfe80422d855`
- Final restore target: `/tmp/habitat-sim-restore-20260717T162717Z`
- Archive excludes `.git`, dependencies, build output, browser reports, and generated TypeScript build state.

## Procedure and Evidence

1. `scripts/backup.sh` created the archive, adjacent checksum, and verified tar readability.
2. `scripts/restore.sh` validated the checksum before extraction and confirmed required recovery files.
3. `npm ci` installed 59 packages from the lockfile and audited 60 packages with zero known vulnerabilities.
4. `npm run check` passed in the restored source:
   - strict TypeScript validation;
   - 12 unit/integration tests;
   - production Vite build.
5. Restored production bundle: 235.46 kilobytes JavaScript and 28.98 kilobytes CSS before compression.
6. After governance and changelog closeout, a final documentation-complete archive was created, checksum-validated, and restored successfully. Runtime source did not change between the fully tested and final archives.

## Integrity Anchors

| File | SHA-256 |
|---|---|
| `MVP.md` | `a11fc1ee21083310bbf687be82e632629de3fac6dcff05b2083119ff3153289a` |
| `docs/science-model.md` | `09bd4562d21d14ae5b68718d788dc97afa9475ad6dd7401bbc71b8e2c2587e37` |
| `src/simulation/planet.ts` | `48321f7d77ae0fe8dc0af1cca03ef96c8a26fd341b6295433ae47389e948dc1f` |
| `src/components/Views.tsx` | `9c7fc3050c9b68d9b195adf6f7199439df54023ed7ed01b7a4599703d1e2d50a` |
| `CHANGELOG.md` | `3b876d4ca09a6e016794c3caf3ce2a38c55303135afa3cb59275630ec22bd1c8` |
| Governance JSON | `419df60d6e848d83b3f62995be7bb5975f51907f9a0762f210d9a7d88cd6f140` |

## Result

**Pass.** Recovery point and restore objectives remain satisfied. The verified archive can restore the complete local iteration without the original working directory or dependency tree.
