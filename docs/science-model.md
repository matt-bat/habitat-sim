# Science Model and Uncertainty

## Evidence Classes

- `grounded`: direction and dependency are well supported, though the implementation remains coarse.
- `coarse`: a known process is represented by a simplified proxy or compressed reservoir.
- `speculative`: a scenario is scientifically unresolved or intentionally exploratory.

## Model Boundaries

The model combines known relationships with bounded heuristic rates. It does not calculate full radiative transfer, fluid dynamics, mantle convection, reaction kinetics, genomes, or anatomy. Results are useful for comparisons inside the model, not numeric forecasts for real planets.

## Scientific Anchors

- Habitable-zone context follows the idea of inner water-loss and outer maximum-greenhouse limits; placement alone does not establish surface habitability. See [Kopparapu et al., 2013](https://arxiv.org/abs/1301.6674).
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

