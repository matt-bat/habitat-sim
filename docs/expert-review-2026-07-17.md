# Sequential Expert Review — 2026-07-17

## Review Contract

Six specialist perspectives inspect the existing implementation one at a time. Each review distinguishes: current strengths, scientific or product weaknesses, implement-now priorities, and deliberately deferred research-scale work. Findings are consolidated only after the sixth review so one domain cannot silently dominate the model.

The shared scoring scale is 0–5: absent, major deficiencies, partial, adequate, strong, excellent. The final weighted assessment uses scientific integrity (25%), causal model coverage (20%), experimental utility (15%), interface and explanation (20%), reliability and accessibility (10%), and maintainability and documentation (10%).

## Expert 1 — Exoplanet Astrophysics and Orbital Dynamics

**Role perspective:** exoplanet climate-orbit modeler concerned with incident energy, time-varying stellar hazards, atmospheric loss, and honest observability.

### Evidence inspected

- `src/simulation/planet.ts`: orbit-averaged flux, Kopparapu limits, equilibrium temperature, escape proxy, and tidal-lock heuristic.
- `src/simulation/types.ts` and `constants.ts`: stellar, orbital, rotation, and atmosphere inputs.
- `src/components/Views.tsx` and `PlanetVisual.tsx`: habitable-zone and physical-observable presentation.
- `docs/science-model.md`: stated approximation boundaries and scientific anchors.

### Assessment

| Check | Score | Evidence-based finding |
|---|---:|---|
| Dimensioned orbital quantities | 4 | Gravity, escape velocity, year length, flux, and radiative-equilibrium temperature use recognizable physical relationships and units. |
| Habitable-zone honesty | 4 | Spectral limits and explicit warnings avoid equating zone placement with habitability. Planet-mass dependence remains absent. |
| Time-varying forcing | 2 | Eccentricity affects mean flux, but periapsis/apoapsis extremes, seasonal contrast, and stellar aging are not exposed. |
| High-energy environment | 2 | `starActivity` drives a bounded radiation/erosion proxy, but ultraviolet and X-ray/extreme-ultraviolet forcing, flare duty cycle, and age evolution are compressed into one unexplained control. |
| Biosignature context | 3 | Documentation warns about abiotic oxygen around active red stars, but the observable layer does not quantify or flag that false-positive pathway. |
| Interaction clarity | 4 | The observatory gives strong causal context, but several indices lack a visible decomposition into measured-like quantities and heuristic terms. |

**Domain score: 63 / 100.** Strong comparative foundations; insufficient temporal and spectral forcing for a planet-evolution observatory.

### Implement-now priorities

1. Add stellar age and derive an age/activity multiplier, spectral class, approximate main-sequence lifetime, and high-energy irradiation index. Keep these comparative and explicitly labeled.
2. Add periapsis and apoapsis distances/fluxes, orbital forcing amplitude, solar-day length, and rotation-orbit resonance. Use forcing amplitude in climate stability rather than eccentricity alone.
3. Add photosynthetically active radiation opportunity and ultraviolet stress as separate spectral proxies; red stars should not be treated as dimmer versions of the Sun.
4. Surface an abiotic-oxygen false-positive risk driven by high-energy forcing, water loss, low biological production, and oxygen accumulation.
5. Present the orbit as a range and causal pathway: star → orbit → absorbed energy → greenhouse response → water state → biology.

### Do not overclaim

- A spectral proxy is not stellar-atmosphere radiative transfer.
- A tidal-lock or resonance indicator is not a tidal evolution integration.
- Atmospheric escape remains a comparative index until exobase thermodynamics and species-resolved escape are implemented.

### Primary anchors

- Kopparapu et al., *Habitable Zones Around Main-Sequence Stars: Dependence on Planetary Mass*: https://arxiv.org/abs/1404.5292
- Luger and Barnes, *Extreme Water Loss and Abiotic O₂ Buildup*: https://pmc.ncbi.nlm.nih.gov/articles/PMC4323125/
- Ribas et al., *Evolution of Solar High-Energy Irradiance*: https://arxiv.org/abs/astro-ph/0412253
- NASA, *Eccentric Habitable Zones*: https://science.nasa.gov/resource/eccentric-habitable-zones/

## Expert 2 — Planetary Geophysics and Geochemistry

**Role perspective:** planetary interior and surface-geochemistry specialist focused on thermal evolution, volatile exchange, weathering, nutrient access, and mass-balance credibility.

### Evidence inspected

- `src/simulation/planet.ts`: interior cooling, dynamo, outgassing, hydrothermal, pH, and nutrient proxies.
- `src/simulation/interventions.ts`: impact, volcanism, and delivered-material effects.
- `src/simulation/engine.ts`: tick order, milestones, snapshots, and import compatibility.
- `src/simulation/types.ts`: interior, surface, chemistry, and elemental-reservoir contracts.
- `tests/simulation.test.ts` and `docs/architecture.md`: enforced invariants and stated model boundaries.

### Assessment

| Check | Score | Evidence-based finding |
|---|---:|---|
| Interior differentiation | 3 | Core and mantle fractions affect heat, dynamo, volcanism, and gravity, but bulk density and composition diagnostics are absent. |
| Thermal evolution and dynamo | 3 | Heat decays and rotation/core state affect a labeled proxy. Inner-core crystallization, compositional buoyancy, and non-monotonic dynamo histories are intentionally unresolved. |
| Tectonic and volcanic regime | 3 | Mobility, water, heat, volcanism, and outgassing are coupled, but the user cannot distinguish mobile-lid, episodic-lid, and stagnant-lid consequences. |
| Long carbon cycle | 2 | Outgassing and a tectonic/water carbon sink exist, but no visible weathering flux, burial/recycling ledger, or supply-limited regime explains climate stabilization or failure. |
| Nutrient and redox cycles | 2 | One nutrient index and static elemental abundance compress phosphorus release, iron availability, burial, recycling, and ocean redox. |
| Material conservation | 2 | Atmospheric partial pressures are much improved, but ocean, crust, mantle, and biomass do not yet form auditable element budgets. |

**Domain score: 49 / 100.** The causal direction is generally defensible; material cycling is the largest realism gap.

### Implement-now priorities

1. Derive bulk density, internal heat-flow opportunity, tectonic regime, silicate-weathering flux, volcanic reducing-power flux, and nutrient-recycling efficiency. Label estimates versus indices.
2. Replace the opaque climate-stabilization story with a visible carbon-cycle balance: outgassing source versus land and seafloor weathering sinks.
3. Expose phosphorus, iron, and nitrogen accessibility separately, even if the first implementation remains a bounded availability ledger rather than molar geochemistry.
4. Distinguish land weathering from anoxic seafloor weathering so ocean worlds are not automatically nutrient-starved.
5. Add geosphere milestone events for tectonic-regime transitions, carbon-cycle imbalance, and severe nutrient limitation.

### Do not overclaim

- A tectonic regime label is a phenomenological classification, not a mantle-convection solution.
- Magnetic shielding should not be presented as universally necessary or monotonically protective.
- Element-accessibility indices are not conserved mole inventories until explicit crust-ocean-biomass fluxes exist.

### Primary anchors

- Guimond et al., mantle redox and secondary atmospheres: https://pmc.ncbi.nlm.nih.gov/articles/PMC7331660/
- Syverson et al., anoxic seafloor weathering and phosphorus supply: https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2021GL094442
- Krissansen-Totton and Catling, seafloor weathering and habitability: https://arxiv.org/abs/2005.09092
- USGS, volcanic carbon dioxide in the long carbon cycle: https://www.usgs.gov/publications/natural-sources-greenhouse-gases-carbon-dioxide-emissions-volcanoes

## Expert 3 — Climate Science and Atmospheric Chemistry

**Role perspective:** planetary climate and atmospheric-chemistry scientist evaluating energy balance, feedbacks, volatile phases, circulation limits, and biosignature context.

### Evidence inspected

- `src/simulation/planet.ts`: equilibrium temperature, greenhouse warming, pressure, erosion, water phase, pH, and atmospheric fluxes.
- `src/simulation/interventions.ts`: flare, volcanic, comet, and impact perturbations.
- `src/components/Views.tsx`: atmospheric partial-pressure ledger and climate observables.
- `src/App.tsx`: user controls for albedo, orbit, atmosphere, rotation, obliquity, and water.
- Timeline and snapshot contracts for climate-state history.

### Assessment

| Check | Score | Evidence-based finding |
|---|---:|---|
| Top-of-atmosphere energy balance | 3 | Absorbed-flux temperature is dimensioned and understandable, but uses a fixed user albedo throughout evolution. |
| Greenhouse representation | 2 | Pressure and absorber abundance affect warming, but a single capped heuristic does not expose gas contributions, saturation behavior, clouds, or collision-induced absorption limits. |
| Climate feedbacks | 1 | Ice changes with temperature but does not feed back into effective albedo; water vapor, clouds, ocean heat capacity, and weathering feedbacks are mostly absent. |
| Climate regimes and thresholds | 2 | Liquid water and temperature are continuous, but snowball, moist/runaway greenhouse, arid, and collapse risks are not classified or explained. |
| Atmospheric chemistry | 3 | Species-resolved partial pressures and source/sink updates are a solid ledger foundation. Photolysis, haze, aerosols, and ocean-atmosphere partitioning remain compressed. |
| Perturbation and recovery | 2 | Events change reservoirs immediately; duration, decay, peak forcing, and recovery curves are not yet first-class state. |

**Domain score: 43 / 100.** The current climate is useful for comparison, but missing feedbacks make long-run transitions look smoother and more certain than planetary climates are.

### Implement-now priorities

1. Derive a state-dependent effective albedo from base surface reflectivity, ice, ocean, and a bounded cloud proxy; feed it back into absorbed energy with damped temperature response.
2. Calculate absorbed stellar energy in watts per square metre and expose greenhouse contribution, water-vapor feedback, cloud fraction, and hydrological-cycle intensity as clearly qualified estimates or indices.
3. Classify climate regimes and risks: snowball, cold/arid, temperate, moist greenhouse, runaway/hothouse, and atmospheric-collapse risk. Use non-color labels and causal explanations.
4. Make greenhouse forcing depend on partial pressures rather than normalized fractions, preserving the atmosphere ledger’s physical meaning.
5. Expose orbital thermal forcing range and climate-buffer capacity from pressure, ocean inventory, and rotation; do not hide eccentric extremes inside a mean.

### Do not overclaim

- A zero-dimensional energy-balance model cannot resolve latitude, seasons, circulation, cloud geography, or tidally locked day/night climates.
- Climate regime thresholds are warning diagnostics, not exact bifurcation boundaries.
- Oxygen, methane, or redox disequilibrium require stellar and planetary context before any biosignature interpretation.

### Primary anchors

- Way et al., three-dimensional warm Earth-like climate simulations: https://www.giss.nasa.gov/pubs/abs/wa08700a.html
- Paradise and Menou, climate stability and the carbonate-silicate cycle: https://arxiv.org/abs/1411.5564
- Krissansen-Totton et al., carbonate-silicate climate predictions: https://arxiv.org/abs/2012.00819
- Schwieterman et al., oxygen biosignatures in environmental context: https://pmc.ncbi.nlm.nih.gov/articles/PMC6014580/

## Expert 4 — Prebiotic Chemistry and Origins of Life

**Role perspective:** origins-of-life chemist evaluating feedstocks, reaction environments, concentration, catalysis, compartmentalization, heredity, degradation, and the boundary between chemistry and Darwinian evolution.

### Evidence inspected

- `src/simulation/planet.ts`: organic, monomer, lipid, nucleotide, polymer, protocell, and redox updates.
- `src/simulation/life.ts`: readiness threshold, opportunity-rate hazard, failed attempts, and first-lineage creation.
- `src/simulation/constants.ts`: wet-dry, hydrothermal, atmospheric, exogenous, lithopanspermia, and custom protocols.
- `src/simulation/interventions.ts`: delivered organics, water, microbes, spores, and nutrients.
- Origins workspace and pre-lineage innovation graph.

### Assessment

| Check | Score | Evidence-based finding |
|---|---:|---|
| Competing origin environments | 4 | Several major environmental hypotheses are user-testable and honestly uncertainty-labeled. Molecular hypotheses such as mineral templates, lipid-first, and ice concentration are absent. |
| Feedstock and energy coupling | 3 | Organics, monomer analogues, minerals, redox, ultraviolet-like energy, and delivery interact, but reaction compatibility is reduced to additive bounded indices. |
| Concentration and degradation | 2 | Wet-dry and vent concentration aid synthesis; hydrolysis, dilution, thermal decomposition, photodestruction, adsorption, and export are not balanced explicitly. |
| Compartments and heredity | 2 | Lipids, polymers, protocells, membrane, and genome gates exist, but compartment stability and heritable replication fidelity are not independently observable. |
| Abiogenesis uncertainty | 4 | The opportunity-rate hazard is clearly labeled as a model assumption and avoids claiming a measured probability. “Failed attempts” currently count time-step trials rather than chemically distinct experiments. |
| Exogenous-seed realism | 3 | Cargo and survival are configurable, but entry heating, impact energy, atmospheric shielding, protected depth, contamination, and habitat compatibility are compressed. |

**Domain score: 55 / 100.** Unusually thoughtful uncertainty language and experimentation support; the next leap is a visible reaction-network readiness model rather than a single composite gauge.

### Implement-now priorities

1. Derive and display six origin gates separately: feedstock, usable energy, concentration, catalysis, compartment stability, and heredity opportunity. Make the limiting gate control the opportunity rate.
2. Add degradation and dilution pressure to prevent every favorable reservoir from monotonically accumulating toward success.
3. Add mineral-template, lipid-first, and ice-eutectic protocols using the existing bounded parameters with distinct context-fit functions and speculative labels.
4. Replace ambiguous “failed attempts” language with “sampled origin opportunities”; expose the current model hazard per million years and clearly state that it is not an empirical probability.
5. Add a delivery-survival diagnostic for biological cargo based on atmosphere, radiation, impact magnitude, and configured protected survival fraction.

### Do not overclaim

- No implemented protocol is a demonstrated historical path to life.
- Building blocks in meteorites support delivery, not extraterrestrial life or successful abiogenesis.
- Named monomer and polymer reservoirs are functional analogues, not fully specified reaction mixtures.

### Primary anchors

- Damer and Deamer, wet-dry nucleotide polymerization experiments: https://pmc.ncbi.nlm.nih.gov/articles/PMC11626162/
- Sojo et al., alkaline hydrothermal gradients and early bioenergetics: https://pubmed.ncbi.nlm.nih.gov/26841066/
- Barge et al., experimental alkaline-vent reactor: https://pmc.ncbi.nlm.nih.gov/articles/PMC4247476/
- NASA OSIRIS-REx, prebiotic compounds in Bennu samples: https://ntrs.nasa.gov/api/citations/20250010870/downloads/GlavinPrebioticSTI.pdf?attachment=true

## Expert 5 — Evolutionary Biology and Ecosystem Dynamics

**Role perspective:** evolutionary biologist and ecosystem modeler focused on population variation, selection, drift, contingency, major transitions, trophic energetics, and eco-evolutionary feedback.

### Evidence inspected

- `src/simulation/life.ts`: trait mutation, fitness, carrying capacity, predation, role inference, speciation, extinction, oxygenation, and structure innovation.
- `src/simulation/constants.ts`: organelle/organ prerequisites, capabilities, evidence, and maintenance costs.
- `src/simulation/types.ts`: lineage, diet, traits, food-web, ancestry, and stage contracts.
- Biosphere and Lineages workspaces: population ranking, network links, traits, elemental basis, structures, and capability readouts.
- Deterministic ecology and oxygen-budget tests.

### Assessment

| Check | Score | Evidence-based finding |
|---|---:|---|
| Selection and demographic feedback | 3 | Thermal, radiation, oxygen, water, energy, cost, density, mutation, and extinction affect populations. Genetic drift and effective-population effects remain implicit. |
| Branching and contingency | 3 | Seeded stochastic divergence and ancestry exist, and the interface rejects inevitable progress. A fixed stage order and irreversible structures still create ladder pressure. |
| Major evolutionary transitions | 2 | Mitochondrion-like and chloroplast-like structures are rare and costly, but currently appear as single-lineage innovations rather than symbiotic integrations requiring ecological partners. |
| Ecosystem energetics | 3 | Producers, consumers, decomposers, detritus, oxygen sources/sinks, and resource links interact. Consumption is a simple best-prey rule without saturating functional responses. |
| Niche and spatial ecology | 2 | Habitat labels influence explanation but are selected from one global surface state; refugia, migration, biome area, and local carrying capacities are absent. |
| Biological observability | 3 | Population, biomass, fitness, diet, elemental reliance, structures, and capabilities are visible. Fitness decomposition, trophic level, generation strategy, energy budget, and ecosystem diversity indices are missing. |

**Domain score: 53 / 100.** The simulator genuinely performs selection and interaction, but its most dramatic transitions need stronger ecological prerequisites and better observability.

### Implement-now priorities

1. Add ecosystem diagnostics: Shannon diversity, evenness, food-web connectance, mean trophic level, primary-production index, recycling efficiency, and extinction pressure.
2. Add lineage diagnostics: realized energy budget, maintenance burden, niche breadth, environmental fit, trophic level, ecological impact, and selection pressure. Show the fitness decomposition rather than one badge.
3. Require a plausible partner/ecological context for mitochondrion-like and chloroplast-like endosymbioses; emit mutualism links and exceptionally rare transition events.
4. Add competition and mutualism links from niche overlap and cooperation, not only consumption links.
5. Expand functional body systems with osmoregulation, structural support, excretion, immune defense, and centralized information processing while retaining “analogue” language.
6. Add an ancestry/innovation path that makes branching, extinctions, and retained versus novel structures visually legible.

### Do not overclaim

- Population aggregates are not individuals, genomes, or reproductive-isolation models.
- Earth organ names denote functional analogues and do not predict alien anatomy.
- More structures or larger bodies are not intrinsically fitter; every innovation must impose maintenance and ecological trade-offs.

### Primary anchors

- Lenski et al., contingent evolution of complex features in digital organisms: https://www.nature.com/articles/nature01568
- Archibald, endosymbiosis and organelle origins: https://pmc.ncbi.nlm.nih.gov/articles/PMC4571569/
- Bozdag et al., oxygen limitation and multicellular size trade-offs: https://pmc.ncbi.nlm.nih.gov/articles/PMC8121917/
- Ratcliff et al., cooperation and multicellularity: https://pubmed.ncbi.nlm.nih.gov/26246549/

## Expert 6 — Scientific Visualization and Human-Computer Interaction

**Role perspective:** scientific-visualization researcher and interaction designer treating Habitat Sim as a live instrument, not a generic analytics dashboard.

### Evidence inspected

- All six root workspaces at desktop `1728 × 1117` and mobile `412 × 915`; deterministic baseline captures are stored outside the repository at `/tmp/habitat-sim-expert-ui-before/`.
- `src/App.tsx`: navigation, transport, keyboard controls, experiment builder, intervention composer, storage, import/export, and state feedback.
- `src/components/PlanetVisual.tsx`, `Views.tsx`, and `Primitives.tsx`: visual encodings and drill-in behavior.
- `src/styles.css`: fixed Spatial Canvas, responsive rules, focus, contrast, typography, motion, and scroll behavior.
- Playwright user flows and the previous interface quality audit.

### Assessment

| Check | Score | Evidence-based finding |
|---|---:|---|
| Product-specific visual identity | 5 | The cutaway planet, orbital reticle, spectral glow, telemetry, dark laboratory palette, and persistent intervention transport unmistakably belong to this application. |
| Information architecture | 4 | Six root workspaces and a one-action home anchor are excellent. Dense scientific detail is split by task instead of hidden in nested routes. |
| Causal visualization | 3 | Bottlenecks and before/after events are strong, but the core star→climate→chemistry→life chain is not visually connected; food webs are rows rather than networks. |
| Parameter ergonomics | 2 | The Lab presents more than twenty similarly weighted sliders in one field, with no domain groups, search, numeric-plus-range pairing, sensitivity preview, or changed-value summary. |
| Responsive behavior | 3 | Mobile preserves every task and persistent controls, but the two bottom bars consume substantial space and obscure the next panel boundary in several captures. Existing captures cover the viewport, not every scrolled state. |
| Accessibility and legibility | 3 | Semantic buttons, labels, keyboard shortcuts, reduced motion, status announcements, and focus rules are present. Several labels at 7–9 pixels are too small for sustained scientific reading. |

**Domain score: 67 / 100.** Visually distinctive and structurally strong; the next step is richer scientific visualization, less slider fatigue, larger microcopy, and complete mobile-state evidence.

### Implement-now priorities

1. Add a live causal systems ribbon on the Planet workspace linking stellar forcing, climate, geochemistry, origin gates, biosphere, and complexity with current state and bottleneck emphasis.
2. Replace isolated orbital numbers with a compact eccentric-orbit instrument showing periapsis/apoapsis forcing and climate-regime position.
3. Turn origin readiness into a six-gate visual matrix with the limiting gate, hazard, and degradation pressure visible at a glance.
4. Turn the living Biosphere workspace into a true ecosystem observatory: diversity indices, productivity/recycling, trophic structure, and an actual node-link energy web when lineages exist.
5. Add a fitness/energy decomposition and ancestry innovation trail to the lineage inspector.
6. Reorganize the Lab into named star/orbit, bulk planet, interior, surface, atmosphere, and evolution groups with compact section identity and a “changes from preset” summary.
7. Raise microcopy floors, tighten empty-state whitespace, and capture top/middle/bottom mobile scroll states plus deterministic living-state views.

### Interface principles applied

- One clear primary intent per root workspace; progressive disclosure for expert controls.
- Recognition over recall through visible units, evidence labels, and current-state explanations.
- Non-color cues and explicit labels for regime, confidence, and warnings.
- Motion communicates simulation state and causality only; reduced-motion behavior remains complete.
- Fixed-frame desktop with narrowly scoped mobile scrolling where content density demands it.

### Standards anchors

- W3C Web Content Accessibility Guidelines 2.2: https://www.w3.org/TR/WCAG22/
- Nielsen Norman Group usability heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- MIT user-interface design and usability materials: https://web.mit.edu/6.813/www/sp16/classes/01-usability/

## Consolidated Implementation Plan

### Connected surfaces

1. **Scientific contracts:** extend stellar age, origin theories, observables, ecosystem diagnostics, lineage diagnostics, and functional structures in `types.ts` and presets.
2. **Planet engine:** implement orbital extremes, spectral/high-energy proxies, state-dependent albedo, partial-pressure greenhouse contributions, climate regimes, geochemical cycles, nutrient accessibility, and origin-gate diagnostics.
3. **Life engine:** make origin hazard gate-limited, add degradation pressure, constrain endosymbiosis, add ecological links, and compute fitness/energy diagnostics.
4. **Summary and compatibility:** expose new diagnostics without breaking version-1 imports; absent new fields derive safely from the restored state.
5. **Purpose-built interface:** add causal ribbon, orbit/climate instrument, origin gate matrix, ecosystem intelligence, lineage decomposition, and grouped Lab controls.
6. **Validation:** add branch-level unit tests, desktop/mobile browser flows, full screenshot sweep including living fixtures, accessibility/overflow assertions, production build, audit, backup, and isolated restore.

### Shared invariants

- Determinism for identical seeds, parameters, and interventions.
- Dimensioned values use valid relationships and units; heuristic outputs say estimate, proxy, risk, or model index.
- Atmospheric additions preserve existing partial-pressure inventories.
- No biological transition is inevitable or rewarded merely for being “more complex.”
- Every functional innovation has prerequisites, continuing cost, and an inspectable causal event.
- Legacy version-1 experiment imports remain bounded and usable.

### Prioritization

- **Must implement:** orbital/climate/geochemical observables, six origin gates, ecosystem and lineage diagnostics, causal visual ribbon, grouped Lab, tests, and screenshot audit.
- **Implement if stable:** additional origin protocols, functional systems, mutualism/competition links, and endosymbiosis constraints.
- **Defer:** spatial climate grid, explicit genome sequences, mole-conserving global biogeochemistry, fluid dynamics, radiative transfer, and individual-based populations.

## Pre-implementation Weighted Assessment

| Category | Weight | Score | Weighted contribution |
|---|---:|---:|---:|
| Scientific integrity | 25% | 62 | 15.5 |
| Causal model coverage | 20% | 51 | 10.2 |
| Experimental utility | 15% | 76 | 11.4 |
| Interface and explanation | 20% | 78 | 15.6 |
| Reliability and accessibility | 10% | 86 | 8.6 |
| Maintainability and documentation | 10% | 88 | 8.8 |

**Baseline: 70.1 / 100.** Strong deterministic product and interface foundation; the score is limited by missing climate feedbacks, explicit material cycles, origin-gate decomposition, ecological transition prerequisites, and scientific visualization depth.

## Final Weighted Assessment

All six reviews were completed sequentially before their findings were consolidated. The connected implementation now includes every must-implement item and the stable optional items: orbital and stellar-history diagnostics, climate feedback/readouts, geochemical access, six origin gates, degradation, three additional origin protocols, ecosystem and lineage diagnostics, ecological partner constraints, richer functional systems, causal visualizations, and grouped experiment controls.

| Category | Weight | Before | Final | Weighted final contribution |
|---|---:|---:|---:|---:|
| Scientific integrity | 25% | 62 | 85 | 21.25 |
| Causal model coverage | 20% | 51 | 84 | 16.80 |
| Experimental utility | 15% | 76 | 91 | 13.65 |
| Interface and explanation | 20% | 78 | 95 | 19.00 |
| Reliability and accessibility | 10% | 86 | 94 | 9.40 |
| Maintainability and documentation | 10% | 88 | 94 | 9.40 |

**Final: 89.5 / 100, up 19.4 points.** This is a strong production comparative simulator, not a research-grade predictive instrument. Scientific integrity is intentionally capped below the interface score because the model still lacks spatial climate, explicit radiative transfer, conserved global biogeochemical moles, molecular reaction kinetics, genomes, and individual organisms.

### Validation evidence

- 14 deterministic unit/integration tests cover normalization, orbital extremes, stellar history, climate/geochemical bounds, six origin gates, interventions, ecological diagnostics, lineage energy accounting, oxygen production, deterministic replay, and import safety.
- 10 Playwright runs cover five application workflows across desktop and mobile projects, including mobile horizontal-overflow assertions.
- The production TypeScript/Vite build passes.
- A 40-image audit covers all six sterile root views, internal scroll depth where present, and living five-lineage Biosphere, Lineages, and Timeline states at desktop and mobile sizes.
- Pre-change backup/restore and final post-change recovery verification protect the critical iteration.

### Remaining research priorities

1. Conserve carbon, nitrogen, phosphorus, sulfur, iron, and water across explicit atmosphere/ocean/crust/mantle/biomass reservoirs.
2. Add spatial habitat patches, migration, seasons, local refugia, and climate circulation.
3. Replace bounded reaction and trophic heuristics with stoichiometric guilds, explicit energy yields, and saturating functional responses.
4. Add ensemble/sensitivity analysis and uncertainty intervals around assumptions.
5. Validate with domain-specific benchmark scenarios before any claim beyond comparative educational exploration.
