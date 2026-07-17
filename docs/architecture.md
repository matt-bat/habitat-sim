# Architecture

## Design Direction

Habitat Sim uses a domain-separated TypeScript simulation core and a React interface. The core owns deterministic state transitions; the interface owns experiment editing, visualization, and inspection.

```text
Experiment definition
  -> deterministic random streams
  -> star/orbit forcing
  -> interior and magnetic state
  -> atmosphere and surface state
  -> chemistry reservoirs
  -> populations and selection
  -> ecology and food web
  -> timeline, snapshots, summary
  -> React Spatial Canvas
```

## Core Invariants

- Identical seed, normalized parameters, and intervention schedule produce identical results.
- Every random draw comes from the simulation's seeded generator.
- State fields stay finite and within documented bounds.
- Atmosphere fractions are normalized before use.
- Population counts and reservoir amounts never become negative.
- Structures require prerequisites and impose costs.
- Interventions append immutable ledger entries with applied effects.
- Timeline records causal identifiers and state deltas for major transitions.

## Source Domains

| Path | Responsibility |
|---|---|
| `src/simulation/types.ts` | Stable state and event contracts |
| `src/simulation/constants.ts` | Presets, bounds, traits, and structure definitions |
| `src/simulation/random.ts` | Deterministic random streams |
| `src/simulation/planet.ts` | Interior, atmosphere, climate, water, and chemistry updates |
| `src/simulation/life.ts` | Origin gates, lineages, evolution, and ecology |
| `src/simulation/interventions.ts` | Validated event effects |
| `src/simulation/engine.ts` | Ordered tick orchestration and summaries |
| `src/components/*` | Root views, controls, visualization, drawers |
| `tests/*` | Engine and browser behavior coverage |

## Tick Order

1. Apply interventions due at or before the current age.
2. Update stellar forcing and radiation.
3. Update interior heat, core activity, dynamo, volcanism, and tectonics.
4. Exchange atmospheric and surface reservoirs.
5. Update temperature, water phase balance, weathering, and nutrient availability.
6. Run prebiotic chemistry opportunities.
7. Update population energy, growth, mutation, selection, interactions, and extinction.
8. Infer trophic roles and food-web links.
9. Detect milestones, capture snapshots, and update summary metrics.

## Performance Boundary

The first slice uses population aggregates rather than individuals. This preserves meaningful selection and ecology while keeping the model inspectable. A worker/typed-array rewrite is deferred until contracts and invariants are stable.
