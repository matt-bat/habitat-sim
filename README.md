# Habitat Sim

[![Quality](https://github.com/matt-bat/habitat-sim/actions/workflows/ci.yml/badge.svg)](https://github.com/matt-bat/habitat-sim/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.1.1-72d5b0)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-attribution--required%20non--commercial-d9ad68)](./LICENSE)

**Live application:** [matt-bat.github.io/habitat-sim](https://matt-bat.github.io/habitat-sim/)

Habitat Sim is a deterministic planetary-life sandbox by Matt Bateman. It models one planet as coupled stellar, orbital, interior, atmosphere, surface, chemistry, population, and ecology systems. Users can build research-framed experiments in a guided Sim Wizard, test origin-of-life hypotheses, intervene during a run, inspect evolving lineages, and drill into a causal timeline.

The project is a comparative explanatory model, not a first-principles geophysics, climate, chemistry, genetics, or anatomy solver. Outputs are labeled as grounded, coarse, or speculative. Habitable-zone placement is context, not proof of habitability or life.

## Production Capabilities

- Seeded deterministic planet experiments
- One-, two-, and three-star aggregate forcing experiments; stellar age, spectral class, high-energy history, photosynthetic-light opportunity, eccentric forcing extremes, solar day, spectral habitable-zone limits, gravity, escape velocity, orbital period, density, composition, core, and tectonic regime
- State-dependent albedo, absorbed stellar energy, partial-pressure greenhouse decomposition, climate regimes, hydrological and climate-buffer indices, snowball/runaway/collapse warnings, and abiotic-oxygen risk
- Partial-pressure atmospheric ledger, real-scale pH proxy, carbon-cycle balance, land/seafloor weathering, outgassing, separate phosphorus/nitrogen/iron access, oxygen sources/sinks, persistent detritus, and ranked causal bottlenecks
- Carbon, hydrogen, nitrogen, oxygen, phosphorus, sulfur, iron, organics, amino-acid-like, lipid-like, nucleotide-like, polymer, and protocell reservoirs
- Wet-dry, RNA-first, hydrothermal, atmospheric-energy, ultraviolet-network, ice-eutectic, mineral-template, lipid-first, exogenous-organic, lithopanspermia, and custom origin protocols
- Six explicit origin gates—feedstock, energy, concentration, catalysis, compartments, and heredity—with degradation, delivery-survival, limiting-gate, and comparative hazard diagnostics
- Asteroid, comet, microbial, spore, flare, quiet-star, volcanic, nutrient, custom, and sterilizing interventions
- Population-level mutation, selection, speciation, extinction, partner-constrained endosymbiosis, functional organelles/body systems, maintenance costs, and staged organization
- Emergent producer, herbivore, carnivore, omnivore, decomposer, parasite, and generalist roles
- Predator/prey, competition, mutualism, parasitism, grazing, decomposition, and resource-flow links
- Shannon diversity, evenness, web connectance, trophic level, primary productivity, recycling, extinction pressure, energy surplus, niche breadth, selection pressure, and ecological-impact diagnostics
- Drillable timeline entries with causes, before/after deltas, confidence, and model notes
- Nineteen immutable research scenarios spanning early-Earth brackets, seven mechanistic/delivery origin experiments, multi-star and M-dwarf systems, Hycean and hydrogen-greenhouse proxies, unusual compositions, and an explicit outside-model methane boundary case
- Seven-step Sim Wizard with reversible navigation, deterministic plans, adaptive causal guidance, research citations, launch blockers, model-boundary acknowledgement, draft autosave, and immutable built-in versus user-owned preset semantics
- Editable, duplicable, importable, exportable, and locally persistent user presets kept separate from running simulation snapshots
- Versioned JSON import/export with bounded validation and exact version-2 random-stream checkpoint resume
- Purpose-built causal observatory with orbit/climate instrumentation, a six-system ribbon, origin-gate matrix, ecosystem topology, lineage energy accounting, and grouped live-preview experiment controls
- Fixed-frame Spatial Canvas interface with responsive tablet/mobile adaptation, 44-pixel mobile targets, and a reproducible six-resolution, 44-state scroll-depth screenshot audit down to 320 CSS pixels
- Automated WCAG A/AA scene scans and functional coverage across Chromium, Firefox, WebKit, Pixel 7, and iPhone 15 profiles

The locked scope and acceptance criteria are in [MVP.md](./MVP.md).

## Stack

- TypeScript
- React
- Vite
- Vitest
- Playwright
- axe-core
- Lucide icons

## Local Setup

Prerequisites: Node.js 20.19 or newer and npm.

```sh
npm ci
npm run dev
```

The development server uses `http://127.0.0.1:5174`.

To inspect the exact repository-subpath build used by GitHub Pages:

```sh
npm run build:pages
npm run preview:pages
```

The Pages-form preview is served at `http://127.0.0.1:4174/habitat-sim/`.

## Validation Commands

```sh
npx tsc --noEmit
npm test
npm run build
npm run check:budgets
npm run test:browser
npm run screenshots -- artifacts/ui
```

`npm run test:browser` builds and previews the app on port `4174`, then runs 70 functional, accessibility, and reflow checks across desktop Chromium, Pixel 7 Chromium, desktop Firefox, desktop WebKit, and iPhone 15 WebKit. On a new machine, install the required browser engines with `npx playwright install --with-deps chromium firefox webkit`.

## Repository Map

```text
src/
  components/       interface views and visual primitives
  features/         Lab and Sim Wizard product flows
  simulation/       deterministic domain model
  storage/          bounded preset and draft persistence
tests/
  browser/          Playwright user flows
docs/               architecture, science, governance, and operations
scripts/            backup and restore utilities
```

## Model Order

Each simulation tick applies due interventions, stellar forcing, interior evolution, atmosphere/surface exchanges, prebiotic chemistry, population selection, ecological interactions, milestone detection, and snapshots in that order. See [architecture](./docs/architecture.md) and [science model](./docs/science-model.md).

## Back Up and Restore

```sh
bash scripts/backup.sh /absolute/backup/directory
bash scripts/restore.sh /absolute/archive.tar.gz /absolute/new-empty-target
```

See [local operations](./docs/operations.md) for scope, retention, recovery objectives, and restore-drill policy.

## Known Limits

- Global reservoirs compress geography, seasons, circulation, and local refugia.
- Climate, atmospheric escape, pH, tidal state, and oxygenation remain comparative aggregate proxies; inspect `docs/science-model.md` before interpreting output.
- Population aggregates stand in for individuals and literal genomes.
- Structure names describe functional analogues; alien morphology is not predicted.
- Origin probabilities are model assumptions around unresolved science.
- Imported snapshots resume from a deterministic checkpoint stream but are not a cryptographic audit trail.
- The simulation remains on the main browser thread for the MVP.
- GitHub Pages hosts the static browser application; no backend, accounts, telemetry, or cloud sync are included.

## License and Attribution

Copyright © 2026 Matt Bateman. Habitat Sim uses a custom Attribution-Required Non-Commercial License. Use, copying, modification, and redistribution require visible attribution to Matt Bateman, the Habitat Sim project name, and the [original repository](https://github.com/matt-bat/habitat-sim). Commercial use requires prior written permission.

This is a source-available license and is not represented as an Open Source Initiative-approved license. See [LICENSE](./LICENSE) for the controlling terms and [CHANGELOG](./CHANGELOG.md) for release history.

Security reports should follow [SECURITY.md](./SECURITY.md). Contributions should follow [CONTRIBUTING.md](./CONTRIBUTING.md).

## Documentation

- [Protoverse source review](./docs/source-review.md)
- [Architecture](./docs/architecture.md)
- [Science and uncertainty](./docs/science-model.md)
- [Six sequential expert reviews](./docs/expert-review-2026-07-17.md)
- [Stacked engineering and science review](./docs/engineering-review-2026-07-17.md)
- [Operations](./docs/operations.md)
- [Interface quality gate](./docs/ui-quality.md)
- [Observatory screenshot audit](./docs/ui-audit/2026-07-17.md)
- [Expert-iteration interface audit](./docs/ui-audit/2026-07-17-expert-iteration.md)
- [Five-resolution Sim Wizard interface audit](./docs/ui-audit/2026-07-17-sim-wizard.md)
- [Cross-engine accessibility and reflow audit](./docs/ui-audit/2026-07-18-compatibility.md)
- [Validation and regression map](./docs/validation.md)
- [Skill application and policy audit](./docs/skill-application.md)
- [User instruction tracker](./user-instructions.md)
- [Release history](./CHANGELOG.md)
