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
- Expert iteration: orbital extremes, stellar age/high-energy stress, climate-regime and geochemical bounds, six origin gates, added protocols, ecosystem statistics, trophic level, lineage maintenance and selection diagnostics.
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

### Six-Expert Scientific and Interface Iteration

- `npm run check`: pass; strict TypeScript, 14 deterministic unit/integration tests, and optimized production build.
- `npm run test:browser`: pass; 10 Chromium runs across desktop and mobile projects, including causal observatory content, origin gates, grouped Lab controls, custom cargo, safe sterile lineages, and root-level mobile horizontal-overflow assertions.
- `npm run screenshots -- /tmp/habitat-sim-expert-ui-final`: pass; 40 captures cover all sterile roots, internal scroll depth, and living five-lineage Biosphere, Lineages, and Timeline states at desktop and mobile sizes.
- Sequential expert weighted assessment: 89.5/100, up from 70.1; `docs/expert-review-2026-07-17.md` records all six independent reviews, their evidence, implemented findings, and research limits.
- Interface audit: pass at 95.4/100; `docs/ui-audit/2026-07-17-expert-iteration.md` records the capture matrix, findings, and residual risks.
- `npm audit --audit-level=high`: zero known vulnerabilities.
- Production bundle: 258.99 kilobytes JavaScript and 39.11 kilobytes CSS before compression; 81.92 and 8.15 kilobytes gzip respectively.
- Post-change archive: `habitat-sim-20260717T182525Z.tar.gz`; SHA-256 and tar verification passed.
- Isolated restore: pass at `/tmp/habitat-sim-expert-final-restore-20260717T182525Z`; clean install found zero vulnerabilities and restored `npm run check` passed with all 14 tests and the production build.
- Recovery evidence: `docs/restore-drills/2026-07-17-expert-iteration.md`.

### Sim Wizard and Scenario Laboratory 1.1.0

- `npm run check`: pass; strict TypeScript, 27 deterministic unit/integration tests across four files, and an optimized production build.
- `npm run build:pages`: pass; generated HTML uses `/habitat-sim/assets/` for the repository Pages base.
- `npm run test:browser`: pass; 20 Chromium runs across desktop and mobile projects cover the seven-step Wizard, adaptive guidance, preset persistence/duplication/deletion/undo, reviewed launch, interventions, all primary workspaces, accessible names, 44-pixel Wizard targets, and compact-width geometry.
- `npm audit --audit-level=high`: zero known vulnerabilities.
- Production bundle: 350.31 kilobytes JavaScript and 75.09 kilobytes CSS before compression; 107.26 and 14.09 kilobytes gzip respectively, inside the 120/20-kilobyte release budgets.
- Full-state visual audit: 44 canonical states at five production resolutions generated 452 captures; two targeted 118-capture mobile correction/Pages-form sweeps produced 688 total images with zero capture, console, root-overflow, or tracked-panel-overflow failures.
- Import/checkpoint hardening: version-2 exports resume the exact pseudo-random stream; legacy version-1 remains deterministic; unknown enums, invalid nested records, non-finite fields, and physically impossible imported indices are rejected or bounded.
- Scenario/persistence gates: 19 immutable built-ins normalize without mutation; pre-life oxygen, origin taxonomy, multi-star forcing proxies, unsupported biochemistry, user-preset lifecycle, import conflicts, and bounded draft storage have direct tests.
- Pages-equivalent local verification: the application shell and hashed JavaScript/CSS assets return HTTP 200 from `/habitat-sim/`; the final mobile matrix ran against that exact subpath build.
- Recovery: the checksum-verified archive `habitat-sim-20260718T005119Z.tar.gz` restored into an isolated directory; clean `npm ci`, all 27 tests, strict TypeScript, root build, Pages build, and source-hash parity passed. See `docs/restore-drills/2026-07-17-sim-wizard-release.md`.
- GitHub Actions run `29626244946`: pass for quality, dependency audit, all 27 tests/build, all 20 browser workflows, Pages-form build, artifact upload, public deployment, and hosted shell/asset verification.
- Public host: `https://matt-bat.github.io/habitat-sim/` returns HTTP 200; both generated JavaScript/CSS assets return HTTP 200.
- Hosted interface: two complete five-profile, 44-state sweeps generated 904 public captures. The final 452-capture sweep enforced root and every visible tracked-panel overflow as hard failures and completed with none; total local/hosted iterative evidence is 1,592 screenshots.

## Remediated Findings

- Non-finite planet parameters incorrectly fell to lower bounds instead of documented defaults.
- Browser automation could not start because the preview command was absent.
- Browser locators relied on partial accessible-name matching and hidden mobile decoration.
- Imported experiment nesting was version-checked but not structurally validated.
- Generated TypeScript build state entered backups.

All findings were independently diagnosed, corrected, and covered by rerun evidence.

## Release Decision

Recommendation: `go`. Local implementation, science, responsive, regression, performance, security, recovery, GitHub Actions, public Pages, live assets, and hosted five-resolution interaction gates pass. No required validation layer is deferred. The scientific model remains explanatory and uncertainty-labeled rather than predictive; this is a product constraint, not an unresolved release defect.
