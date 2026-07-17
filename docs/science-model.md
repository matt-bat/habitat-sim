# Science Model and Uncertainty

## Evidence Classes

- `grounded`: direction and dependency are well supported, though the implementation remains coarse.
- `coarse`: a known process is represented by a simplified proxy or compressed reservoir.
- `speculative`: a scenario is scientifically unresolved or intentionally exploratory.

## Model Boundaries

The model combines known relationships with bounded heuristic rates. It does not calculate full radiative transfer, fluid dynamics, mantle convection, reaction kinetics, genomes, or anatomy. Results are useful for comparisons inside the model, not numeric forecasts for real planets.

## Implemented Scientific Contracts

- Atmospheric state changes operate on gas partial pressures in bar. Adding one gas therefore increases total pressure without silently displacing the others. The interface shows partial-pressure inventory rather than treating fractions as conserved mass.
- Orbit-averaged stellar flux includes eccentricity. Conservative runaway-greenhouse and maximum-greenhouse limits use the stellar-effective-temperature polynomial form from Kopparapu et al.
- Surface gravity, escape velocity, and orbital period use dimensioned two-body relationships. Atmospheric retention and tidal-lock risk remain clearly labeled comparative indices.
- The displayed pH is a bounded global carbonate/alkalinity proxy on the real 0–14 pH scale, not a percentage.
- Abiogenesis uses an opportunity-rate hazard: `P(success in Δt) = 1 − exp(−λΔt)`. The rate is a model assumption and is never presented as an observed abiogenesis probability.
- Only high-capability phototrophs or chloroplast-bearing lineages contribute to the oxygenic-production budget. Oxygen accumulation subtracts aggregate respiration, reduced volcanic, and methane sinks, then applies the result as an oxygen partial-pressure flux.
- Detritus is a persistent biomass reservoir. Extinctions add current extinct biomass once; a cumulative extinction counter no longer recreates matter every tick.
- Grazing adds producer consumption to lineage diet records, allowing herbivore and omnivore summaries to emerge from consumed resources.
- Limiting-factor output separates a model-index score, evidence class, current observation, and counterfactual action.

## Observatory Outputs

The Planet workspace exposes incident flux, spectral habitable-zone limits, orbital period, gravity, escape velocity, equilibrium temperature, greenhouse delta, tidal-lock risk, pH, atmospheric retention, climate stability, redox disequilibrium, interior forcing, surface exchange, gas partial pressures, and ranked limiting factors. Values without defensible physical units are explicitly called model indices.

## Scientific Anchors

- Habitable-zone context follows the idea of inner water-loss and outer maximum-greenhouse limits; placement alone does not establish surface habitability. See [Kopparapu et al., 2013](https://arxiv.org/abs/1301.6674).
- Eccentricity changes orbit-averaged incident flux; spin state and close-orbit tidal evolution are treated as context rather than a deterministic habitability verdict. See [Barnes, 2017](https://arxiv.org/abs/1708.02981).
- Magnetic fields are not modeled as monotonic atmospheric-retention shields. Escape is driven primarily by stellar activity, atmospheric column, and gravity, with only a small radiation-modulation proxy. See [Gunell et al., 2018](https://www.aanda.org/articles/aa/full_html/2018/06/aa32934-18/aa32934-18.html).
- Active low-mass stars can create severe early water loss and abiotic oxygen, so oxygen is not treated as an unambiguous biosignature. See [Luger and Barnes, 2015](https://arxiv.org/abs/1411.7412) and [Schwieterman et al., 2018](https://doi.org/10.1089/ast.2017.1729).
- Interior redox, melt flux, and volatile solubility can change secondary atmosphere composition. See [Guimond et al., 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7331660/).
- Large primary atmospheres may erode while leaving substantial secondary volatile inventories. See [Krissansen-Totton et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11437211/).
- Carbonaceous meteorites contain sugar-related and other organic compounds relevant to prebiotic inventories. See [Cooper et al., 2001](https://pubmed.ncbi.nlm.nih.gov/11780054/) and [NASA Astromaterials research](https://ares.jsc.nasa.gov/research/laboratories/soluble-organics-astromaterials.html).
- Complex digital features can emerge through mutation, selection, and contingent stepping stones. See [Lenski et al., 2003](https://www.nature.com/articles/nature01568).
- Trophic structure can emerge in digital ecological networks when predator-prey gains exceed maintenance costs. See [Caldarelli et al., 2007](https://www.nature.com/articles/6801032).
- Mitochondria and plastids are modeled as rare endosymbiotic transitions with energetic consequences. See [Archibald, 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4571569/).
- Oxygenation changes metabolic opportunity but is neither an automatic nor immediate route to complex life. See [Olson et al., 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC2375572/) and [Fischer et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC2606769/).

## Explicitly Speculative Scenarios

- Viable microbes surviving interplanetary transfer.
- Viable fungal spores arriving before local complex ecosystems exist.
- Non-carbon biochemistry represented through user-defined elemental weights.
- Specific complex organs or body plans on alien worlds.

These scenarios must be labeled in the interface and use lower confidence, survivability, or transition priors by default.

## Deliberately Deferred Scientific Depth

- Spatial habitats, migration, refugia, and local seasonal climate.
- Conserved ocean-atmosphere carbon, nitrogen, phosphorus, sulfur, iron, dissolved organic, burial, and remineralization ledgers.
- Reaction-guild stoichiometry, Monod resource limitation, Holling functional responses, and explicit energy yields.
- Duration, half-life, habitat footprint, and recovery curves for every intervention forcing.
- Variant-level innovation fixation/loss, secondary simplification, and a full phylogenetic tree.
- Deterministic multi-seed ensembles, sensitivity tornadoes, and outcome uncertainty intervals.

These are the next fidelity priorities. Adding more unconstrained sliders is intentionally lower priority than conservation, energetics, habitats, and causal observability.
