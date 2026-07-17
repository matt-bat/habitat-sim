# Validation and Regression Map

## Release Risk Summary

- Regression tier: critical for the first public production release.
- Data risk: low; browser-local and export-only.
- Runtime risk: low after deterministic, unit, production-build, and desktop/mobile browser validation.
- Rollback: restore the verified project archive or revert individual local files.

## Connected Impact Map

| Changed surface | Downstream consumers | Required evidence |
|---|---|---|
| Planet parameters and state | climate, chemistry, life fitness, Planet/Lab views | normalization and hostile-world unit tests |
| Origin configuration | chemistry readiness and abiogenesis | deterministic and life-gating unit tests |
| Interventions | planet, chemistry, populations, timeline | beneficial/harmful delta unit test and browser timeline flow |
| Lineage traits/structures | fitness, stages, ecology, inspector | evolution/trophic unit test and lineage view |
| Timeline contracts | event drill-in, export/import | intervention unit test and browser drill-in |
| App navigation/persistence | every user workflow | desktop/mobile Playwright specifications |

## Coverage-to-Change Map

- Unit: parameter normalization, deterministic replay, sterile outcomes, beneficial/harmful interventions, selection/trophic inference, bounded export/import, and malformed-import rejection.
- Integration: engine tests exercise interior → surface → chemistry → population → food-web → timeline state.
- Browser: setup/navigation, play/pause, intervention, event drill-in, origin selection, preset generation, and safe lineage empty/detail state.
- Static: TypeScript strict check.
- Supply chain: npm audit.
- Recovery: checksum archive plus full isolated restore.

## Executed Evidence

- `npm ci`: pass from the release worktree and isolated restored archive; 60 packages audited with zero known vulnerabilities.
- `npm run check`: pass; strict TypeScript validation, 8 unit/integration tests, and optimized production build.
- `npm run test:browser`: pass; 6 Chromium flows across desktop and mobile projects.
- Production bundle: 221.95 kilobytes JavaScript and 21.07 kilobytes CSS before compression.
- Import hardening: invalid nested lineage, timeline, intervention, food-web, snapshot, surface, interior, and chemistry records are rejected.
- Backup archive: `habitat-sim-20260717T154452Z.tar.gz`; adjacent SHA-256 verification passed.
- Full isolated restore: pass; lockfile, engine, and license hashes matched, followed by clean install, all unit/integration tests, and production build.
- GitHub Actions: public-repository quality and browser jobs passed; action dependencies were then advanced to their current version 7 releases to remove the Node.js runtime deprecation warning.

### Science and Observatory Iteration

- `npm run check`: pass; strict TypeScript validation, 12 unit/integration tests, and optimized production build.
- `npm run test:browser`: pass; 8 Chromium flows across desktop and mobile, including custom material cargo and the pre-lineage prerequisite graph.
- `npm run screenshots -- /tmp/habitat-ui-release-2`: pass; all six roots captured at desktop and mobile profiles after a fixed-clock, reduced-motion paint settle.
- Weighted screenshot audit: 91.7/100, up from 71.4; evidence and remaining risks are in `docs/ui-audit/2026-07-17.md`.
- `npm audit --audit-level=high`: zero known vulnerabilities.
- Production bundle: 235.46 kilobytes JavaScript and 28.98 kilobytes CSS before compression.
- Post-change archive: `habitat-sim-20260717T162446Z.tar.gz`; SHA-256 and tar verification passed.
- Isolated restore: pass; clean install, 12 tests, strict TypeScript, and production build all passed from `/tmp/habitat-sim-restore-20260717T162446Z`.
- Final documentation-complete archive: `habitat-sim-20260717T162717Z.tar.gz`; SHA-256 verification and restore to `/tmp/habitat-sim-restore-20260717T162717Z` passed after closeout artifacts were added.

## Remediated Findings

- Non-finite planet parameters incorrectly fell to lower bounds instead of documented defaults.
- Browser automation could not start because the preview command was absent.
- Browser locators relied on partial accessible-name matching and hidden mobile decoration.
- Imported experiment nesting was version-checked but not structurally validated.
- Generated TypeScript build state entered backups.

All findings were independently diagnosed, corrected, and covered by rerun evidence.

## Release Decision

Recommendation: `go`. No required validation layer is deferred. The scientific model remains explanatory and uncertainty-labeled rather than predictive; this is a product constraint, not an unresolved release defect.
