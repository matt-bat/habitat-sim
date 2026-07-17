# Habitat Sim MVP Contract

Status: locked for the first implementation slice  
Date: 2026-07-17  
Execution scope: implemented browser release; public source repository

## Product Goal

Create a deterministic, scientifically framed planetary-life sandbox where a user can configure one rocky planet in a star's habitable-zone context, test origin-of-life hypotheses, intervene during the run, and inspect how chemistry, environment, selection, ecology, and chance shape evolving lineages.

The product is an explanatory model, not a first-principles climate, geophysics, chemistry, or molecular-dynamics solver. Every output must distinguish modeled state, heuristic inference, and speculative possibility.

## Primary User

A curious science enthusiast or educator who wants to ask “what conditions and events might let life emerge and become complex?” and receive an inspectable causal story rather than a single habitability score.

## MVP Success State

A user can create a seeded planet, run or pause geological time, introduce a seeding or environmental event at any point, observe abiotic chemistry become one or more evolving populations when conditions permit, inspect representative organisms and their structures, and drill into a detailed timeline explaining why major transitions occurred.

## In Scope

### 1. Deterministic experiment setup

- Stable text seed plus normalized parameters.
- Star context: mass, effective temperature, luminosity, activity, orbital distance, and eccentricity.
- Planet: mass, radius, gravity, albedo, axial tilt, rotation, water inventory, crust/mantle/core fractions, radionuclide inventory, initial heat, and impact rate.
- Atmosphere: pressure and editable initial gas fractions for nitrogen, carbon dioxide, water vapor, methane, oxygen, hydrogen, ammonia, and sulfur gases; runtime transfers use partial-pressure inventories.
- Presets: Earth-like, ocean world, arid world, reducing atmosphere, stagnant-lid world, and high-activity red-dwarf world.
- A habitability-zone indicator based on incident stellar flux, shown as context rather than proof of habitability.

### 2. Coupled planet state

- Interior heat, core activity, magnetic shielding, volcanism, tectonic recycling, weathering, and outgassing.
- Surface temperature, atmospheric pressure/composition, greenhouse forcing, radiation exposure, liquid water, ice, ocean chemistry, land fraction, and nutrient availability.
- Explicit reservoirs for carbon, hydrogen, nitrogen, oxygen, phosphorus, sulfur, iron/minerals, simple organics, amino-acid-like compounds, lipid-like compounds, nucleotide-like compounds, polymers, and protocells.
- Bounded mass-balance-inspired transfers between reservoirs. The MVP may use calibrated coarse equations but must avoid unexplained arbitrary jumps.

### 3. Origin-of-life experiments

- Selectable hypotheses:
  - surface pond and wet-dry cycling;
  - hydrothermal mineral-catalysis;
  - atmospheric energy chemistry;
  - exogenous organic delivery by asteroid or comet;
  - lithopanspermia or direct microbial seeding as explicitly speculative scenarios.
- Custom hypothesis parameters: cargo, dose, survival fraction, energy source, catalytic environment, recurrence, and timing.
- Origin is probabilistic and gated by resources, energy gradients, solvent conditions, stability, and elapsed opportunities. It cannot be forced merely by increasing one generic “life probability” slider.

### 4. Mid-simulation interventions

- Schedule or immediately apply:
  - asteroid/comet impacts with water, minerals, amino acids, nucleobases, organics, ice, microbes, or spores;
  - stellar flares and quiet intervals;
  - volcanic pulses;
  - ocean/atmosphere composition changes;
  - nutrient deposition;
  - sterilizing impacts.
- Fungal spores are permitted only as an overtly speculative/contamination scenario because fungi presuppose complex prior evolution.
- Each event records before/after deltas, beneficial and harmful effects, survivability, uncertainty, and causal links.

### 5. Darwinian population simulation

- Population-level lineages with inherited trait vectors, mutation, selection, drift, competition, extinction, and speciation.
- Fitness depends on local environment, metabolic energy, resource acquisition, temperature/radiation tolerance, reproductive cost, and ecological interactions.
- Major stages: protocell, simple cell, complex cell, colony, multicellular organism, and complex organism.
- Structures may emerge only when prerequisites and evolutionary opportunities exist:
  - membrane, genome/polymer system, ribosome-like machinery;
  - nucleus-like compartment, mitochondrion-like and chloroplast-like endosymbionts, vacuole, flagellum/cilia;
  - tissue systems and representative organs for later multicellular forms.
- Organelles and organs provide explicit capabilities and energetic costs. They are not decorative badges.
- Representative organism inspection includes elemental basis, metabolism, energy source, environment, population, fitness, trophic role, tolerances, structures, capabilities, and ancestry.

### 6. Ecology and food web

- Resource competition, producer/consumer/decomposer roles, predation, grazing, scavenging, parasitism, and mutualism.
- Herbivore, carnivore, and omnivore labels are emergent summaries of consumed energy sources, not user-assigned classes.
- Predator/prey and resource-flow breakdown with population and energy-transfer estimates.
- Extinctions and ecological releases must affect surviving lineages.

### 7. Inspectable history

- Timeline entries for physical transitions, intervention events, abiogenesis attempts, first life, metabolic innovations, oxygenation, endosymbiosis, multicellularity, speciation, trophic shifts, mass extinctions, and recoveries.
- Drill-in detail: trigger, preconditions, state deltas, affected lineages, causal parents, confidence, and model note.
- Periodic snapshots allow a user to compare current and past atmosphere, planet, chemistry, biodiversity, and dominant lineages.

### 8. Spatial Canvas interface

- One-screen application frame with no page-level scrollbar on desktop.
- Root-level views: Planet, Origins, Biosphere, Lineages, Timeline, and Lab.
- A persistent one-click home/Planet anchor.
- In-situ detail drawers or overlays for lineages and timeline events.
- Visible play/pause, step, speed, age, habitability context, biosphere status, and intervention action.
- Keyboard access, visible focus, non-color status cues, reduced-motion support, and responsive mobile fallback.

### 9. Experiment persistence

- Save experiments locally with seed, parameters, interventions, current summary, and timeline.
- Import/export versioned JSON with validation and bounded size.
- Deterministic replay for an identical seed, parameters, and intervention schedule.

## MVP Scientific Framing

- Track uncertainty and evidence class for major assumptions: `grounded`, `coarse`, or `speculative`.
- Separate habitable-zone placement, surface habitability, abiogenesis opportunity, inhabited state, and complex-life support.
- Do not imply inevitability, directionality, or a ladder of evolution.
- “Complex” means organizational/energetic complexity in this model, not superiority.
- Results are comparative thought experiments, not predictions of real exoplanets.

## Assumptions and Constraints

- The first release is a browser-only TypeScript prototype with population aggregates and global planetary reservoirs.
- Carbon-water life receives the deepest built-in model because it has the strongest empirical basis; custom elemental weights remain exploratory.
- Rates are calibrated for inspectable comparative runs, not claimed as universal physical constants.
- Regional geography, literal genomes, exact anatomy, and three-dimensional circulation are deferred.
- The browser application is implemented and its source is published; hosted deployment remains outside this contract.
- Unit, build, and browser execution ownership remains an open verification question, but it does not change the implementation contract.

## Open Questions

- Non-blocking: whether the model or user should run broad test/build checks by default for this new project.
- No product-design question currently blocks the locked MVP.

## Acceptance Criteria

1. Identical seed, normalized parameters, and intervention schedule produce identical summaries and timeline events.
2. Invalid numeric or imported values are clamped or rejected without crashing.
3. Interior, atmosphere, surface, chemistry, and biosphere state update together each simulation tick.
4. At least five origin presets and one fully custom origin configuration are usable.
5. At least six intervention types can be applied mid-run and appear in the timeline with measurable deltas.
6. A run can remain sterile; unfavorable conditions do not guarantee life.
7. Favorable seeded runs can progress through multiple life stages, but complex life remains conditional and uncommon.
8. Lineages mutate, compete, speciate, and go extinct through environment-dependent fitness.
9. Trophic roles and predator/prey links derive from observed resource consumption.
10. The lineage inspector shows chemical basis, structures, capabilities, costs, tolerances, ecology, and ancestry.
11. Timeline detail exposes causes, affected systems, confidence, and before/after data.
12. Desktop core workflows fit within a fixed application frame; mobile keeps every workflow reachable.
13. Unit tests cover deterministic replay, parameter normalization, intervention effects, life gating, evolution, and trophic inference.
14. Browser tests cover setup, run controls, intervention, lineage detail, and timeline drill-in.
15. README and architecture/science notes clearly document limitations, commands, data model, and source basis.

## Non-Goals for MVP

- Atom-by-atom chemistry or molecular dynamics.
- Full three-dimensional general circulation or plate-tectonic solvers.
- Literal genetic sequences, protein folding, or anatomically complete organisms.
- Intelligence, civilization, technology, language, or spaceflight progression.
- Multiplayer, accounts, cloud synchronization, or a public backend.
- Claims that any displayed alien morphology is scientifically predicted.
- Deployment or publication.

## Deferred After MVP

- Web Worker and typed-array simulation core for large populations.
- Multiple biomes with migration on a geographic grid.
- Branch comparison and batch Monte Carlo experiment sweeps.
- Rich fossil record and phylogenetic tree visualization.
- User-authored reaction networks and organelle definitions.
- Exportable datasets, charts, and classroom scenario packs.
- More rigorous stellar evolution, atmospheric escape, carbonate-silicate cycling, ocean circulation, and isotope models.

## Scope Lock

The first build must prefer a coherent, inspectable coarse model over feature count. New ideas may be documented, but they cannot displace deterministic replay, coupled planetary state, origin experiments, interventions, Darwinian populations, ecological interactions, lineage inspection, and timeline drill-in.
