# User Instructions Tracker

## Status Model

Allowed values: `pending`, `in_progress`, `blocked`, `done`, `won_t_do`.

| Instruction ID | Instruction | Source | Status | Priority | Owner | Last Updated UTC | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|
| INST-000 | Backfill repository instruction history | Repository bootstrap, 2026-07-17 | done | low | model | 2026-07-17T14:48:01Z | This tracker and INST-001 through INST-009 | Initial repository; no earlier local history exists. |
| INST-001 | Thoroughly review Protoverse Lab before implementation | User request, 2026-07-17 | done | high | model | 2026-07-17T14:48:01Z | `docs/source-review.md` | Full source, tests, interface, performance, and documentation reviewed. |
| INST-002 | Write and follow an MVP before building | User request, 2026-07-17 | done | high | model | 2026-07-17T14:48:01Z | `MVP.md` | MVP was the first Habitat Sim artifact. |
| INST-003 | Build a single-planet life-development simulator | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `src/`, `tests/`, `README.md` | Functional local MVP slice implemented. |
| INST-004 | Model atmospheres, composition, core activity, and planetary conditions | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `src/simulation/planet.ts`, `types.ts` | Coupled bounded reservoirs update each tick. |
| INST-005 | Support origin theories and custom seeding parameters | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `constants.ts`, `life.ts`, Origins view | Five presets plus custom controls implemented. |
| INST-006 | Support mid-simulation interventions and varied cargo | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `interventions.ts`, Lab and transport controls | Nine typed interventions plus custom cargo contract. |
| INST-007 | Model structures, capabilities, chemistry, and complex life | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `life.ts`, `constants.ts`, lineage inspector | Prerequisites, capabilities, costs, and stages implemented. |
| INST-008 | Model Darwinian ecology, diets, food webs, and drillable history | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `life.ts`, Biosphere and Timeline views | Selection, trophic inference, deltas, and causal drill-in implemented. |
| INST-009 | Apply every agent-command-center skill | User request, 2026-07-17 | done | high | model | 2026-07-17T15:12:48Z | `docs/skill-application.md`, governance artifact | All 31 skills applied or explicitly inactive/no-change. |
| INST-010 | Publish Habitat Sim as a public repository | User request, 2026-07-17 | done | high | model | 2026-07-17T15:51:09Z | `https://github.com/matt-bat/habitat-sim`, `package.json`, `.github/` | Public `main` branch published under the Matt Bateman account. |
| INST-011 | Require attribution to Matt Bateman using the established project license pattern | User request, 2026-07-17 | done | high | model | 2026-07-17T15:41:18Z | `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md` | Established attribution-required non-commercial terms adapted with the requested full author name. |
| INST-012 | Iterate until production ready | User request, 2026-07-17 | done | high | model | 2026-07-17T15:51:09Z | `docs/validation.md`, `.github/workflows/ci.yml`, `docs/restore-drills/2026-07-17-full.md` | Local, restored-source, and public continuous-integration gates pass; no validation layer remains deferred. |
