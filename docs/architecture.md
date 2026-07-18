# Architecture

## Design Direction

Habitat Sim uses a domain-separated TypeScript simulation core and a React interface. The core owns deterministic state transitions; the interface owns experiment editing, visualization, and inspection.

```text
Experiment definition
  -> scenario normalization and adaptive guidance
  -> deterministic random streams
  -> single/multiple-star aggregate forcing and orbit
  -> interior and magnetic state
  -> atmosphere and surface state
  -> chemistry reservoirs
  -> populations and selection
  -> ecology and food web
  -> origin, ecosystem, lineage, and causal diagnostics
  -> timeline, snapshots, summary
  -> React Spatial Canvas
```

## Core Invariants

- Identical seed, normalized parameters, and intervention schedule produce identical results.
- Every random draw comes from the simulation's seeded generator.
- Version-2 exports checkpoint and restore the seeded generator exactly; legacy version-1 imports receive a deterministic compatibility stream.
- State fields stay finite and within documented bounds.
- Initial atmosphere fractions are normalized before use; subsequent sources and sinks are applied to partial-pressure inventories and total pressure is recomputed.
- Population counts and reservoir amounts never become negative.
- Structures require prerequisites and impose costs.
- Endosymbiotic structures require compatible partner populations; ecological links distinguish consumption, competition, mutualism, parasitism, grazing, and decomposition.
- Origin opportunity is limited by the weakest explicit chemistry gate and opposed by degradation pressure.
- Dimensioned observables and bounded indices remain distinct in names, units, and interface copy.
- Interventions append immutable ledger entries with applied effects.
- Timeline records causal identifiers and state deltas for major transitions.
- Immutable built-ins, user-owned presets, Wizard drafts, and running snapshots use separate contracts and storage keys.
- Unsupported alternative biochemistry can expose climate/inventory bookkeeping but cannot enter the terrestrial abiogenesis or lineage engine.

## Source Domains

| Path | Responsibility |
|---|---|
| `src/simulation/types.ts` | Stable state and event contracts |
| `src/simulation/constants.ts` | Defaults, origin protocols, and structure definitions |
| `src/simulation/parameters.ts` | Canonical numeric parameter registry, bounds, units, evidence, and help copy |
| `src/simulation/presets.ts` | Immutable scenario catalog and scientific-source registry |
| `src/simulation/guidance.ts` | Pure, deterministic cross-parameter guidance and launch validation |
| `src/simulation/random.ts` | Deterministic random streams |
| `src/simulation/planet.ts` | Stellar/orbital observables, interior, atmosphere, climate, geochemistry, water, chemistry, and origin-gate diagnostics |
| `src/simulation/life.ts` | Origin events, lineage energetics, evolution, ecological interactions, and ecosystem diagnostics |
| `src/simulation/interventions.ts` | Validated event effects |
| `src/simulation/engine.ts` | Ordered tick orchestration and summaries |
| `src/storage/presets.ts` | Versioned bounded user-preset and Wizard-draft persistence |
| `src/features/sim-wizard/*` | Seven-step configuration, provenance, adaptive help, and review flow |
| `src/features/lab/*` | Expert quick editor and running-snapshot tools |
| `src/components/*` | Root views, controls, visualization, drawers |
| `tests/*` | Engine and browser behavior coverage |

## Tick Order

1. Apply interventions due at or before the current age.
2. Update age-adjusted stellar forcing, spectral/radiation stress, and orbital forcing context.
3. Update interior heat, core activity, dynamo, volcanism, and tectonics.
4. Exchange atmospheric partial pressures and surface reservoirs without silently displacing unchanged gases.
5. Update feedback-aware effective albedo, temperature, water phase balance, land/seafloor weathering, carbon balance, and nutrient access.
6. Update chemistry reservoirs with production, dilution, thermal/radiative degradation, and six-gate origin opportunities.
7. Update lineage environmental fit, energy acquisition, maintenance, growth, mutation, selection, and extinction.
8. Infer trophic roles; resolve predation, grazing, competition, mutualism, parasitism, decomposition, and partner-constrained innovations.
9. Derive planet, origin, ecosystem, and lineage diagnostics; detect milestones, capture snapshots, and update summary metrics.

## Diagnostic Layer

The summary layer derives observability without mutating the experiment. `PlanetObservables` contains dimensioned physical quantities and clearly named indices; `OriginDiagnostics` exposes six gates and their limiting gate; `EcosystemDiagnostics` summarizes community structure; `LineageDiagnostics` explains organism-level energetic viability and ecological pressure. React consumes these contracts directly, so the same causal quantities used by tests drive the interface.

## Performance Boundary

The first slice uses population aggregates rather than individuals. This preserves meaningful selection and ecology while keeping the model inspectable. A worker/typed-array rewrite is deferred until contracts and invariants are stable.

The optimized 1.1.0 application remains below the release budgets of 120 kilobytes gzip JavaScript and 20 kilobytes gzip CSS. Summary observables are derived once per render path and reused by lineage diagnostics. The engine remains intentionally on the main thread; bounded lineage, event, snapshot, intervention, preset, and import sizes prevent unbounded browser work.
