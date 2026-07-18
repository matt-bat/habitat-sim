# Stacked Engineering and Science Review — 2026-07-17

## Scope and Method

Three independent review stacks inspected the pre-Wizard repository before implementation:

1. Architecture and release engineering: module ownership, state contracts, deterministic replay, persistence boundaries, import safety, performance budgets, and Pages delivery.
2. Planetary and origin science: early-Earth validity, origin-mechanism taxonomy, multiple-star limits, atmosphere/composition semantics, evidence labeling, and model boundaries.
3. Product, interface, and accessibility: information architecture, reversible setup, preset ownership, adaptive help, responsive behavior, touch/keyboard access, and complete-state visual coverage.

The stacks scored independently before their findings were consolidated. The weighted baseline was **52.5 / 100**: architecture 54.3, science 45.5, and product/interface 58.4. The largest blockers were the generic “Earth-like” preset, conflated setup/running saves, no guided configuration, single-star-only inputs, incomplete import checkpointing, no Pages path, and insufficient full-state responsive evidence.

## Review Contract

The production candidate had to satisfy all of the following together:

- Four defensible pre-life/early-Earth uncertainty brackets and at least five credible origin mechanisms.
- Clear separation between local abiogenesis mechanisms, ingredient delivery, and relocation/panspermia.
- Editable and savable user presets without mutating built-ins or conflating them with running-state snapshots.
- Experimental worlds spanning composition, solvent/model boundaries, stellar class, one/two/three stars, pressure, water inventory, and classical-zone context.
- A reversible setup Wizard with contextual, parameter-dependent scientific guidance and a causal review before launch.
- Exact deterministic checkpoint resume, bounded imports, and unsupported-biochemistry isolation.
- Purpose-built responsive interface with keyboard labels, mobile targets, no root overflow, and evidence across five common resolutions.
- Production budgets of at most 120 kilobytes gzip JavaScript and 20 kilobytes gzip CSS.
- Unit, browser, backup, restore, continuous-integration, public-repository, Pages, and live-asset verification gates.

## Findings and Resolution

| Finding | Resolution | Evidence |
|---|---|---|
| Generic “Earth-like” initial state implied more certainty and oxygen than a pre-life analogue permits | Replaced the legacy catalog with Hadean cooling, late-Hadean shore, Eoarchean vent, and Archean haze brackets; each carries evidence, citations, confidence, and caveats | `src/simulation/presets.ts`, preset tests |
| Delivery was mixed into origin mechanisms | Wizard and Origins surfaces separate seven mechanistic experiments from exogenous-organic and lithopanspermia overlays | `SimWizard.tsx`, `Views.tsx` |
| Single-star contract blocked requested experiments | Added one-, circumbinary-, and hierarchical-triple aggregate forcing, companion contribution, variability, and explicit N-body caveats | `types.ts`, `planet.ts`, guidance and preset tests |
| Parameter definitions and bounds were duplicated | `parameters.ts` is now the canonical registry used to derive engine bounds and every editor control/help contract | `parameters.ts`, `constants.ts` |
| Setup definitions, drafts, and running saves shared ambiguous semantics | Built-ins are immutable; user presets, Wizard drafts, and simulation snapshots have separate versioned stores and workflows | `storage/presets.ts`, App/Lab/Wizard, persistence tests |
| Imports resumed with a new pseudo-random stream and accepted finite but impossible state values | Export v2 stores generator state; resume is bit-exact; nested enums/records and physical/index ranges are validated or bounded | `random.ts`, `engine.ts`, simulation tests |
| Expert Lab edits could be overwritten by React object churn | Draft initialization is keyed to the actual simulation seed rather than cloned object identity | `LabView.tsx` |
| Users had no guided way to understand coupled consequences | Seven reversible steps, adaptive Impact Lens, field-level science notes, blockers, provenance, model-fit labels, and review/acknowledgement gate | `features/sim-wizard/*`, `guidance.ts` |
| Alternative solvents could accidentally enter terrestrial evolution | `unsupported-alternative` disables terrestrial abiogenesis and lineages while retaining clearly bounded climate/inventory inspection | `life.ts`, preset and simulation tests |
| No production hosting contract | Pages-specific base build, official Pages actions, deployment environment, and live shell/asset verifier added | `vite.config.ts`, workflow, `verify-pages.mjs` |
| Responsive evidence was too narrow | 44 canonical states captured at five resolutions with top/middle/bottom internal depth, hashes, geometry, focus, and console checks | Sim Wizard interface audit |

## Final Weighted Assessment

Each category contains multiple independent checks; the score is deliberately capped by the explanatory model boundary rather than visual polish.

| Category | Weight | Checks | Rating | Weighted |
|---|---:|---|---:|---:|
| Scientific integrity and research basis | 24 | early-Earth framing; mechanism taxonomy; source provenance; evidence/model-fit labeling; explicit alternative-solvent and multi-star limits | 92 | 22.08 |
| Architecture and data integrity | 18 | canonical registry; separated persistence; deterministic checkpoint; bounded imports; pure guidance; normalized state | 96 | 17.28 |
| Task UX and preset workflow | 17 | reversible seven-step path; immutable/user ownership; save/update/copy/import/export/delete/undo; draft recovery; review before replacement | 97 | 16.49 |
| Visual, responsive, and interaction quality | 16 | bespoke spatial language; six-root continuity; five viewport classes; no root overflow; mobile target sizing; focus and reduced motion | 97 | 15.52 |
| Reliability, testing, and recovery | 13 | 27 unit/integration tests; 20 browser runs; hostile/sterile/alternative paths; screenshot runtime checks; backup and isolated restore | 98 | 12.74 |
| Performance and security | 7 | 107.26 kilobytes gzip JavaScript; 14.09 kilobytes gzip CSS; bounded collections/imports; no dangerous HTML; dependency audit | 96 | 6.72 |
| Documentation and release operations | 5 | MVP amendment; architecture/science synchronization; tracker; changelog/license; CI/Pages/live verification | 98 | 4.90 |
| **Total** | **100** |  |  | **95.73 / 100** |

## Residual Limits

- Multiple-star inputs are irradiance proxies, not stable orbital solutions.
- Climate is global and zero-dimensional; there is no circulation, seasonal geography, cloud geography, or local refuge grid.
- Geochemical accessibility and carbon balance are bounded diagnostics rather than conserved molar ledgers.
- Origin gates compare experiments but are not empirical abiogenesis probabilities.
- Populations stand in for genomes and individuals; named organelles/organs are functional analogues, not alien morphology predictions.
- Dedicated screen-reader sessions, user-scaled typography stress, Firefox/WebKit rendering, and a worker-based simulation remain future hardening opportunities.

These are visible research/product boundaries, not hidden release defects. The release decision is `go` only after the live Pages URL and its hashed assets pass post-deploy verification.
