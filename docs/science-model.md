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
- Binary and hierarchical-triple experiments add representative companion irradiance and variability to the energy budget. They are explicitly aggregate forcing proxies, not N-body integrations or orbital-stability solutions.
- Periapsis/apoapsis distance and flux expose orbital extremes. Stellar age and effective temperature derive a spectral class, approximate main-sequence lifetime fraction, high-energy stress, and photosynthetic-photon opportunity. These are comparative history/spectrum proxies, not stellar-evolution tracks.
- Surface gravity, escape velocity, and orbital period use dimensioned two-body relationships. Atmospheric retention and tidal-lock risk remain clearly labeled comparative indices.
- The displayed pH is a bounded global carbonate/alkalinity proxy on the real 0–14 pH scale, not a percentage.
- Effective albedo responds to surface ice, water, and bounded cloud cover. Greenhouse warming is decomposed by gas partial pressure, and the observatory exposes absorbed watts per square metre, climate regime, hydrological cycling, buffer capacity, and threshold risks. This remains a zero-dimensional energy-balance treatment.
- Abiogenesis uses six explicit gates—feedstock, usable energy, concentration, catalysis, compartment stability, and heredity opportunity—plus degradation pressure. The limiting gate controls an opportunity-rate hazard: `P(success in Δt) = 1 − exp(−λΔt)`. The rate compares in-model experiments and is never presented as an observed abiogenesis probability.
- RNA-first, ultraviolet-network, mineral-template, lipid-first, and ice-eutectic protocols join wet-dry, hydrothermal, and atmospheric mechanisms. Exogenous organics and lithopanspermia are labeled as delivery or relocation overlays rather than explanations for the first local emergence of life. Context fit and evidence class remain separate: a good fit does not make a hypothesis established.
- Tectonic regime, weathering, seafloor weathering, outgassing, carbon-cycle balance, and phosphorus/nitrogen/iron access are separately inspectable bounded diagnostics. They are not conserved molar reservoirs.
- Only high-capability phototrophs or chloroplast-bearing lineages contribute to the oxygenic-production budget. Oxygen accumulation subtracts aggregate respiration, reduced volcanic, and methane sinks, then applies the result as an oxygen partial-pressure flux.
- Detritus is a persistent biomass reservoir. Extinctions add current extinct biomass once; a cumulative extinction counter no longer recreates matter every tick.
- Grazing adds producer consumption to lineage diet records, allowing herbivore and omnivore summaries to emerge from consumed resources.
- Limiting-factor output separates a model-index score, evidence class, current observation, and counterfactual action.
- Ecosystem summaries expose Shannon diversity, evenness, connectance, mean trophic level, productivity, recycling, extinction pressure, and ecological complexity. Lineage summaries decompose environmental fit, energy acquisition, maintenance burden, realized surplus, niche breadth, selection pressure, trophic level, and ecological impact.
- Mitochondrion-like and chloroplast-like innovations require an ecologically plausible partner and can create mutualism links. Competition and mutualism can emerge from niche overlap, complementarity, and cooperation; every structure continues to impose a maintenance cost.
- The built-in scenario catalog records evidence class, model fit (`native`, `proxy`, or `outside-model`), citations, confidence notes, and caveats. Early-Earth scenarios are uncertainty brackets, not claims of one known Hadean atmosphere.
- Alternative-solvent scenarios may exercise climate and inventory bookkeeping, but the aqueous carbon life engine is disabled and requires explicit user acknowledgement before launch.

## Observatory Outputs

The Planet workspace presents a six-system causal chain from star and orbit through climate, geochemistry, origin gates, biosphere, and complexity. It exposes orbital extremes, stellar history/spectrum, absorbed energy, climate regime and risks, greenhouse contributors, tectonic/carbon-cycle behavior, nutrients, gas partial pressures, and ranked counterfactual bottlenecks. Origins, Biosphere, and Lineages then reveal gate, ecosystem, and organism-level decompositions. Values without defensible physical units are explicitly called model indices.

## Scientific Anchors

- Habitable-zone context follows the idea of inner water-loss and outer maximum-greenhouse limits; placement alone does not establish surface habitability. See [Kopparapu et al., 2013](https://arxiv.org/abs/1301.6674).
- Eccentricity changes orbit-averaged incident flux; spin state and close-orbit tidal evolution are treated as context rather than a deterministic habitability verdict. See [Barnes, 2017](https://arxiv.org/abs/1708.02981).
- Young stars impose higher high-energy irradiation than mature stars; the implementation uses this direction as a bounded age/activity proxy. See [Ribas et al., 2005](https://arxiv.org/abs/astro-ph/0412253).
- Magnetic fields are not modeled as monotonic atmospheric-retention shields. Escape is driven primarily by stellar activity, atmospheric column, and gravity, with only a small radiation-modulation proxy. See [Gunell et al., 2018](https://www.aanda.org/articles/aa/full_html/2018/06/aa32934-18/aa32934-18.html).
- Active low-mass stars can create severe early water loss and abiotic oxygen, so oxygen is not treated as an unambiguous biosignature. See [Luger and Barnes, 2015](https://arxiv.org/abs/1411.7412) and [Schwieterman et al., 2018](https://doi.org/10.1089/ast.2017.1729).
- Interior redox, melt flux, and volatile solubility can change secondary atmosphere composition. See [Guimond et al., 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7331660/).
- Seafloor weathering can participate in long-term climate regulation and anoxic alteration can affect phosphorus supply. See [Krissansen-Totton and Catling, 2020](https://arxiv.org/abs/2005.09092) and [Syverson et al., 2021](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2021GL094442).
- Large primary atmospheres may erode while leaving substantial secondary volatile inventories. See [Krissansen-Totton et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11437211/).
- Carbonaceous meteorites contain sugar-related and other organic compounds relevant to prebiotic inventories. See [Cooper et al., 2001](https://pubmed.ncbi.nlm.nih.gov/11780054/) and [NASA Astromaterials research](https://ares.jsc.nasa.gov/research/laboratories/soluble-organics-astromaterials.html).
- Complex digital features can emerge through mutation, selection, and contingent stepping stones. See [Lenski et al., 2003](https://www.nature.com/articles/nature01568).
- Trophic structure can emerge in digital ecological networks when predator-prey gains exceed maintenance costs. See [Caldarelli et al., 2007](https://www.nature.com/articles/6801032).
- Mitochondria and plastids are modeled as rare endosymbiotic transitions with energetic consequences. See [Archibald, 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4571569/).
- Wet-dry cycling, hydrothermal gradients, and mineral interfaces motivate distinct concentration and catalysis gates rather than one readiness score. See [Damer and Deamer, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC11626162/) and [Sojo et al., 2016](https://pubmed.ncbi.nlm.nih.gov/26841066/).
- Oxygenation changes metabolic opportunity but is neither an automatic nor immediate route to complex life. See [Olson et al., 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC2375572/) and [Fischer et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC2606769/).
- Circumbinary habitable-zone context can be estimated from combined stellar forcing, but dynamical stability needs a dedicated solution. See [Cukier et al., 2019](https://arxiv.org/abs/1911.02983) and [Kane and Hinkel, 2013](https://arxiv.org/abs/1211.2812).
- Hydrogen-rich atmospheres can extend liquid-water conditions beyond the classical zone, while proposed Hycean worlds remain demanding boundary cases for pressure and ocean-interior coupling. See [Pierrehumbert and Gaidos, 2011](https://doi.org/10.1088/2041-8205/734/1/L13) and [Madhusudhan et al., 2021](https://doi.org/10.3847/1538-4357/abfd9c).

## Explicitly Speculative Scenarios

- Viable microbes surviving interplanetary transfer.
- Viable fungal spores arriving before local complex ecosystems exist.
- Non-aqueous or non-carbon biochemistry; user-defined elemental weights change accessible inventories but do not implement a new genetic or metabolic chemistry.
- Specific complex organs or body plans on alien worlds.

These scenarios must be labeled in the interface and use lower confidence, survivability, or transition priors by default.

## Deliberately Deferred Scientific Depth

- Spatial habitats, migration, refugia, and local seasonal climate.
- Conserved ocean-atmosphere-crust-mantle-biomass carbon, nitrogen, phosphorus, sulfur, iron, dissolved organic, burial, and remineralization ledgers. Current accessibility and carbon-balance values are bounded diagnostics only.
- Reaction-guild stoichiometry, Monod resource limitation, Holling functional responses, and explicit energy yields.
- Duration, half-life, habitat footprint, and recovery curves for every intervention forcing.
- Variant-level innovation fixation/loss, secondary simplification, and a full phylogenetic tree.
- Deterministic multi-seed ensembles, sensitivity tornadoes, and outcome uncertainty intervals.

These are the next fidelity priorities. Adding more unconstrained sliders is intentionally lower priority than conservation, energetics, habitats, and causal observability.
