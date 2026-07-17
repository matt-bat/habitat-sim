import { STRUCTURE_INFO } from "./constants";
import { clamp, pickWeighted, vary } from "./random";
import { applyAtmosphereFlux, habitabilityScore, prebioticReadiness } from "./planet";
import type {
  ElementalBasis,
  FoodWebLink,
  LifeStage,
  Lineage,
  LineageTraits,
  Metabolism,
  SimulationState,
  StructureId,
  TimelineEvent,
  TrophicRole
} from "./types";

export type EventDraft = Omit<TimelineEvent, "id" | "ageMyr">;

const STAGE_RANK: Record<LifeStage, number> = {
  protocell: 0,
  "simple-cell": 1,
  "complex-cell": 2,
  colony: 3,
  multicellular: 4,
  "complex-organism": 5
};

const NAME_PREFIXES = ["Aero", "Bathy", "Crena", "Dorsa", "Eo", "Ferro", "Halo", "Luma", "Pelago", "Thermo", "Xeno"];
const NAME_SUFFIXES = ["phyte", "coccus", "morph", "bion", "zoa", "myces", "plasma", "thera", "voria", "lith"];

function lineageName(random: () => number, generation: number): string {
  return `${NAME_PREFIXES[Math.floor(random() * NAME_PREFIXES.length)]}${NAME_SUFFIXES[Math.floor(random() * NAME_SUFFIXES.length)]}-${generation}`;
}

function makeElementalBasis(random: () => number): ElementalBasis {
  return {
    carbon: clamp(vary(random, 0.56, 0.08)), hydrogen: clamp(vary(random, 0.68, 0.08)), nitrogen: clamp(vary(random, 0.42, 0.1)),
    oxygen: clamp(vary(random, 0.5, 0.12)), phosphorus: clamp(vary(random, 0.18, 0.06)), sulfur: clamp(vary(random, 0.22, 0.08)), iron: clamp(vary(random, 0.16, 0.08))
  };
}

function initialTraits(random: () => number, state: SimulationState, metabolism: Metabolism): LineageTraits {
  return {
    temperatureOptimum: vary(random, state.surface.temperatureC, 8),
    temperatureTolerance: vary(random, 18, 5),
    radiationResistance: clamp(vary(random, 0.32 + state.surface.radiation * 0.3, 0.12)),
    oxygenUse: state.atmosphere.o2 > 0.02 ? clamp(vary(random, 0.18, 0.1)) : 0.02,
    photosynthesis: metabolism === "phototroph" ? clamp(vary(random, 0.58, 0.12)) : 0.02,
    chemosynthesis: metabolism === "chemotroph" ? clamp(vary(random, 0.64, 0.1)) : 0.04,
    mobility: clamp(vary(random, 0.08, 0.06)), predation: 0.01, digestion: 0.04, cooperation: clamp(vary(random, 0.12, 0.08)),
    defense: clamp(vary(random, 0.12, 0.08)), parasitism: 0.01, size: 0.015, complexity: 0.04, reproduction: clamp(vary(random, 0.62, 0.1))
  };
}

export function createSeededLineage(state: SimulationState, random: () => number, source: "origin" | "microbial" | "spores" = "origin"): Lineage {
  const metabolism = pickWeighted<Metabolism>(random, [
    ["chemotroph", state.surface.hydrothermalActivity + state.chemistry.redoxGradient],
    ["phototroph", 0.35 + (1 - state.surface.radiation) * 0.35],
    ["heterotroph", state.chemistry.simpleOrganics * 0.45],
    ["decomposer", 0.08]
  ]);
  const complexSeed = source === "spores";
  const structures: StructureId[] = complexSeed
    ? ["membrane", "genome", "ribosome", "cell-wall", "nucleus", "mitochondrion", "vacuole"]
    : ["membrane", "genome"];
  const generation = state.lineages.length + 1;
  const traits = initialTraits(random, state, metabolism);
  if (complexSeed) {
    traits.complexity = 0.68;
    traits.cooperation = 0.56;
    traits.size = 0.24;
    traits.oxygenUse = 0.72;
    traits.digestion = 0.46;
  }
  return {
    id: `lin-${generation}-${Math.floor(random() * 1_000_000)}`,
    name: lineageName(random, generation),
    ancestorId: null,
    bornAtMyr: state.ageMyr,
    generation,
    stage: complexSeed ? "complex-cell" : "protocell",
    metabolism: complexSeed ? "decomposer" : metabolism,
    trophicRole: complexSeed ? "decomposer" : metabolism === "phototroph" || metabolism === "chemotroph" ? "producer" : "generalist",
    population: complexSeed ? 220 : source === "microbial" ? 18_000 : 1_400,
    biomass: complexSeed ? 0.012 : 0.002,
    fitness: 0.5,
    habitat: habitatFor(state, traits),
    traits,
    structures,
    elements: makeElementalBasis(random),
    diet: { light: 0, minerals: 0, producers: 0, prey: 0, detritus: 0 },
    capabilities: capabilitiesFor(structures, complexSeed ? "decomposer" : metabolism),
    preyIds: []
  };
}

function habitatFor(state: SimulationState, traits: LineageTraits): string {
  if (state.surface.hydrothermalActivity > 0.62 && traits.chemosynthesis > 0.35) return "hydrothermal vents";
  if (state.surface.oceanCoverage > 0.62) return traits.photosynthesis > 0.35 ? "sunlit ocean" : "deep ocean";
  if (state.surface.landFraction > 0.52 && state.surface.wetDryCycling > 0.35) return "tidal mineral flats";
  return "shallow coastal water";
}

function capabilitiesFor(structures: StructureId[], metabolism: Metabolism): string[] {
  const values = structures.map((structure) => STRUCTURE_INFO[structure].capability);
  if (metabolism === "phototroph" || metabolism === "mixotroph") values.push("Captures stellar energy");
  if (metabolism === "chemotroph") values.push("Uses mineral redox gradients");
  if (metabolism === "heterotroph") values.push("Consumes organic biomass");
  if (metabolism === "decomposer") values.push("Recycles dead organic material");
  return [...new Set(values)];
}

function mutateTraits(parent: LineageTraits, random: () => number, rate: number): LineageTraits {
  const result = { ...parent };
  const scale = 0.025 + rate * 0.055;
  for (const key of Object.keys(result) as Array<keyof LineageTraits>) {
    if (key === "temperatureOptimum") result[key] = vary(random, result[key], 4 * rate);
    else if (key === "temperatureTolerance") result[key] = clamp(vary(random, result[key], 2 * rate), 2, 65);
    else result[key] = clamp(vary(random, result[key], scale));
  }
  return result;
}

function structureCost(lineage: Lineage): number {
  return lineage.structures.reduce((sum, structure) => sum + STRUCTURE_INFO[structure].cost, 0);
}

function inferRole(lineage: Lineage): TrophicRole {
  const diet = lineage.diet;
  const total = Object.values(diet).reduce((sum, amount) => sum + amount, 0);
  if (lineage.traits.parasitism > 0.62 && diet.prey > 0) return "parasite";
  if (lineage.metabolism === "decomposer" || diet.detritus / Math.max(0.001, total) > 0.55) return "decomposer";
  const preyShare = diet.prey / Math.max(0.001, total);
  const producerShare = diet.producers / Math.max(0.001, total);
  if (preyShare > 0.58) return "carnivore";
  if (producerShare > 0.58) return "herbivore";
  if (preyShare > 0.18 && producerShare > 0.18) return "omnivore";
  if (diet.light + diet.minerals > diet.prey + diet.producers + diet.detritus) return "producer";
  return "generalist";
}

function stageFor(lineage: Lineage): LifeStage {
  const has = (structure: StructureId) => lineage.structures.includes(structure);
  if (has("circulatory-system") && has("sensory-network") && lineage.traits.complexity > 0.82) return "complex-organism";
  if (has("digestive-system") && lineage.traits.cooperation > 0.7) return "multicellular";
  if (lineage.traits.cooperation > 0.56 && lineage.traits.size > 0.2) return "colony";
  if (has("nucleus") && has("mitochondrion")) return "complex-cell";
  if (has("ribosome")) return "simple-cell";
  return "protocell";
}

function tryStructureInnovation(state: SimulationState, lineage: Lineage, random: () => number, dt: number): StructureId | null {
  const has = (structure: StructureId) => lineage.structures.includes(structure);
  const candidates: Array<[StructureId, boolean, number]> = [
    ["ribosome", has("genome") && state.chemistry.polymers > 0.08, 0.75],
    ["cell-wall", lineage.traits.defense > 0.28, 0.35],
    ["flagellum", lineage.traits.mobility > 0.28, 0.32],
    ["mitochondrion", state.atmosphere.o2 > 0.025 && lineage.population > 50_000, 0.08],
    ["nucleus", has("mitochondrion") && lineage.traits.complexity > 0.35, 0.16],
    ["chloroplast", has("nucleus") && lineage.traits.photosynthesis > 0.52, 0.11],
    ["vacuole", has("nucleus") && lineage.traits.complexity > 0.42, 0.28],
    ["digestive-system", lineage.stage === "colony" && lineage.traits.digestion > 0.56, 0.15],
    ["respiratory-system", lineage.stage === "multicellular" && lineage.traits.oxygenUse > 0.6, 0.18],
    ["circulatory-system", lineage.stage === "multicellular" && lineage.traits.size > 0.52 && state.atmosphere.o2 > 0.09, 0.1],
    ["sensory-network", lineage.stage === "multicellular" && lineage.traits.mobility + lineage.traits.predation > 0.88, 0.12],
    ["locomotor-system", lineage.stage === "multicellular" && lineage.traits.mobility > 0.62, 0.14],
    ["reproductive-system", lineage.stage === "multicellular" && lineage.traits.cooperation > 0.72, 0.12]
  ];
  for (const [structure, eligible, rate] of candidates) {
    if (!has(structure) && eligible && random() < rate * state.params.mutationRate * dt * 0.00045) return structure;
  }
  return null;
}

function makeSpeciation(parent: Lineage, state: SimulationState, random: () => number): Lineage {
  const childPopulation = Math.max(50, parent.population * (0.08 + random() * 0.1));
  parent.population -= childPopulation;
  const traits = mutateTraits(parent.traits, random, state.params.mutationRate * 1.8);
  const metabolism = pickWeighted<Metabolism>(random, [
    [parent.metabolism, 2.5], ["phototroph", traits.photosynthesis], ["chemotroph", traits.chemosynthesis],
    ["heterotroph", traits.digestion + traits.predation], ["mixotroph", traits.photosynthesis + traits.digestion], ["decomposer", 0.2 + traits.digestion]
  ]);
  const generation = Math.max(...state.lineages.map((lineage) => lineage.generation), 0) + 1;
  const child: Lineage = {
    ...parent,
    id: `lin-${generation}-${Math.floor(random() * 1_000_000)}`,
    name: lineageName(random, generation),
    ancestorId: parent.id,
    bornAtMyr: state.ageMyr,
    generation,
    metabolism,
    population: childPopulation,
    biomass: parent.biomass * childPopulation / Math.max(1, parent.population + childPopulation),
    traits,
    elements: Object.fromEntries(Object.entries(parent.elements).map(([key, value]) => [key, clamp(vary(random, value, 0.025))])) as ElementalBasis,
    diet: { light: 0, minerals: 0, producers: 0, prey: 0, detritus: 0 },
    preyIds: []
  };
  child.habitat = habitatFor(state, traits);
  child.trophicRole = inferRole(child);
  child.capabilities = capabilitiesFor(child.structures, metabolism);
  return child;
}

export function evolveLife(state: SimulationState, dtMyr: number, random: () => number): EventDraft[] {
  const events: EventDraft[] = [];
  const dt = Math.min(dtMyr, 25);
  const readiness = prebioticReadiness(state);

  if (!state.lineages.length) {
    const threshold = 0.34 + state.params.originDifficulty * 0.25;
    if (readiness > threshold) {
      state.chemistry.protocells = clamp(state.chemistry.protocells + (readiness - threshold) * 0.0015 * dt, 0, 1);
      const survivalBoost = state.origin.theory === "lithopanspermia" ? state.origin.survivalFraction * state.origin.exogenousDose : 0;
      const opportunityRate = Math.pow(readiness, 3.5) * (1.05 - state.params.originDifficulty) * 0.0021 + survivalBoost * 0.0004;
      const chance = 1 - Math.exp(-opportunityRate * dt);
      if (random() < chance) {
        const lineage = createSeededLineage(state, random, "origin");
        state.lineages.push(lineage);
        state.chemistry.protocells = clamp(state.chemistry.protocells + 0.12);
        events.push({ kind: "origin", title: "First self-maintaining lineage", summary: `${lineage.name} crossed the model's inheritance and metabolism gates.`, detail: "A bounded stochastic transition succeeded because building blocks, solvent stability, energy gradients, and catalytic opportunity overlapped. This does not claim a known historical pathway.", causes: [`Prebiotic readiness ${(readiness * 100).toFixed(0)}%`, `Origin protocol: ${state.origin.theory}`], effects: { lineages: { before: 0, after: 1 }, protocells: { before: 0, after: state.chemistry.protocells } }, affectedLineageIds: [lineage.id], confidence: "speculative", modelNote: "Abiogenesis timing and mechanism remain unresolved; the model treats origin as a gated opportunity, not inevitability." });
      } else {
        state.failedOriginAttempts += 1;
      }
    }
    return events;
  }

  const links: FoodWebLink[] = [];
  let detritus = state.detritusBiomass + state.lineages.reduce((sum, lineage) => sum + lineage.biomass * 0.004 * dt, 0);
  for (const lineage of state.lineages) {
    lineage.diet = { light: 0, minerals: 0, producers: 0, prey: 0, detritus: 0 };
    lineage.preyIds = [];
  }

  for (const lineage of state.lineages) {
    const thermalFit = clamp(1 - Math.abs(state.surface.temperatureC - lineage.traits.temperatureOptimum) / Math.max(4, lineage.traits.temperatureTolerance));
    const radiationFit = clamp(1 - Math.max(0, state.surface.radiation - lineage.traits.radiationResistance));
    const oxygenFit = lineage.traits.oxygenUse > 0.35 ? clamp(state.atmosphere.o2 * 5.5) : clamp(1 - state.atmosphere.o2 * 0.72);
    const waterFit = clamp(state.surface.liquidWater * 1.35);
    let energy = 0;
    if (lineage.metabolism === "phototroph" || lineage.metabolism === "mixotroph") {
      const light = clamp(stellarFluxProxy(state) * (1 - state.surface.radiation * 0.2)) * lineage.traits.photosynthesis;
      lineage.diet.light += light;
      energy += light;
    }
    if (lineage.metabolism === "chemotroph") {
      const minerals = state.chemistry.redoxGradient * lineage.traits.chemosynthesis;
      lineage.diet.minerals += minerals;
      energy += minerals;
    }
    if (lineage.metabolism === "decomposer") {
      const consumed = Math.min(detritus, lineage.traits.digestion * 0.5 + 0.05);
      detritus -= consumed;
      lineage.diet.detritus += consumed;
      energy += consumed * 0.82;
    }
    if (lineage.metabolism === "heterotroph" || lineage.metabolism === "mixotroph") {
      energy += state.chemistry.simpleOrganics * lineage.traits.digestion * 0.08;
    }
    const cost = 0.14 + structureCost(lineage) + lineage.traits.size * 0.18 + lineage.traits.mobility * 0.08;
    lineage.fitness = clamp((thermalFit * 0.25 + radiationFit * 0.18 + oxygenFit * 0.12 + waterFit * 0.18 + clamp(energy) * 0.27) - cost * 0.18);
    const carrying = 8_000 + state.surface.nutrients * 9_000_000 / Math.max(1, state.lineages.length) + energy * 4_000_000;
    const densityPressure = clamp(lineage.population / carrying, 0, 2);
    const growth = (lineage.fitness - 0.42 - densityPressure * 0.1) * lineage.traits.reproduction * dt * 0.008;
    lineage.population = Math.max(0, lineage.population * Math.exp(growth));
    lineage.biomass = lineage.population * Math.max(0.0000002, lineage.traits.size * 0.000002 + 0.0000003);
    lineage.habitat = habitatFor(state, lineage.traits);
    if (random() < state.params.mutationRate * dt * 0.016) lineage.traits = mutateTraits(lineage.traits, random, state.params.mutationRate * 0.35);
  }

  const consumers = state.lineages.filter((lineage) => lineage.traits.predation + lineage.traits.digestion > 0.34 && lineage.population > 20);
  for (const consumer of consumers) {
    const preyCandidates = state.lineages.filter((prey) => prey.id !== consumer.id && prey.population > 100 && prey.traits.size <= consumer.traits.size * 1.6 + 0.08);
    preyCandidates.sort((a, b) => (b.biomass * (1 - b.traits.defense)) - (a.biomass * (1 - a.traits.defense)));
    const prey = preyCandidates[0];
    if (!prey) continue;
    const attack = clamp((consumer.traits.predation + consumer.traits.mobility * 0.35) - prey.traits.defense * 0.55);
    if (attack <= 0.08) continue;
    const consumed = Math.min(prey.population * 0.08, consumer.population * attack * 0.015 * dt);
    prey.population = Math.max(0, prey.population - consumed);
    consumer.population += consumed * 0.035;
    if (prey.trophicRole === "producer" || prey.metabolism === "phototroph") consumer.diet.producers += consumed;
    else consumer.diet.prey += consumed;
    consumer.preyIds.push(prey.id);
    links.push({ sourceId: consumer.id, targetId: prey.id, relation: consumer.traits.parasitism > 0.62 ? "parasitism" : prey.trophicRole === "producer" ? "grazing" : "predation", energyFlow: consumed });
  }

  for (let index = state.lineages.length - 1; index >= 0; index -= 1) {
    const lineage = state.lineages[index];
    lineage.trophicRole = inferRole(lineage);
    const oldStage = lineage.stage;
    const innovation = tryStructureInnovation(state, lineage, random, dt);
    if (innovation) {
      lineage.structures = [...lineage.structures, innovation];
      lineage.capabilities = capabilitiesFor(lineage.structures, lineage.metabolism);
      events.push({ kind: "evolution", title: `${STRUCTURE_INFO[innovation].label} emerged`, summary: `${lineage.name} gained ${STRUCTURE_INFO[innovation].capability.toLowerCase()}.`, detail: `The structure appeared after its environmental and lineage prerequisites overlapped. It adds capability and a continuing energetic cost of ${STRUCTURE_INFO[innovation].cost.toFixed(2)} model units.`, causes: [lineage.habitat, `Fitness ${lineage.fitness.toFixed(2)}`], effects: { structures: { before: lineage.structures.length - 1, after: lineage.structures.length } }, affectedLineageIds: [lineage.id], confidence: STRUCTURE_INFO[innovation].evidence, modelNote: "The named structure is a functional analogue; morphology is not predicted." });
    }
    lineage.stage = stageFor(lineage);
    if (lineage.stage !== oldStage) {
      events.push({ kind: "evolution", title: `${lineage.name} reached ${lineage.stage}`, summary: `A lineage crossed the model's ${lineage.stage} organization gate.`, detail: "Stage changes summarize acquired structures, cooperation, size, and energy budget. Evolution is branching and has no predetermined goal.", causes: [`Previous stage: ${oldStage}`, `${lineage.structures.length} structures`], effects: { stage: { before: oldStage, after: lineage.stage } }, affectedLineageIds: [lineage.id], confidence: "coarse", modelNote: "Stages compress many possible biological organizations into inspectable functional classes." });
    }
    if (lineage.population < 5 || lineage.fitness < 0.04) {
      state.lineages.splice(index, 1);
      state.extinctionCount += 1;
      detritus += lineage.biomass;
      events.push({ kind: "extinction", title: `${lineage.name} went extinct`, summary: "Environmental mismatch and ecological pressure reduced the population below recovery.", detail: `Last habitat: ${lineage.habitat}. Last modeled fitness: ${lineage.fitness.toFixed(2)}.`, causes: [`Temperature ${state.surface.temperatureC.toFixed(1)}°C`, `Radiation ${(state.surface.radiation * 100).toFixed(0)}%`], effects: { population: { before: Math.round(lineage.population), after: 0 } }, affectedLineageIds: [lineage.id], confidence: "coarse", modelNote: "Population aggregates omit refugia and fine spatial migration." });
    }
  }

  if (state.lineages.length < 24) {
    const parents = [...state.lineages];
    for (const parent of parents) {
      const complexityFactor = 0.4 + parent.traits.complexity;
      const chance = state.params.mutationRate * complexityFactor * Math.log10(Math.max(10, parent.population)) * dt * 0.000035;
      if (parent.population > 35_000 && random() < chance) {
        const child = makeSpeciation(parent, state, random);
        state.lineages.push(child);
        events.push({ kind: "evolution", title: `${child.name} diverged`, summary: `A reproductively distinct lineage split from ${parent.name}.`, detail: "Mutation, ecological opportunity, and population size produced enough modeled trait divergence to count as speciation.", causes: [`Ancestor: ${parent.name}`, `Mutation setting ${(state.params.mutationRate * 100).toFixed(0)}%`], effects: { biodiversity: { before: state.lineages.length - 1, after: state.lineages.length } }, affectedLineageIds: [parent.id, child.id], confidence: "coarse", modelNote: "Species are trait clusters, not full genetic compatibility models." });
      }
    }
  }

  state.detritusBiomass = Math.max(0, detritus);
  const oxygenicBiomass = state.lineages.reduce((sum, lineage) => {
    const oxygenic = (lineage.metabolism === "phototroph" || lineage.metabolism === "mixotroph")
      && (lineage.structures.includes("chloroplast") || lineage.traits.photosynthesis > 0.72);
    return sum + (oxygenic ? lineage.biomass * lineage.traits.photosynthesis : 0);
  }, 0);
  const respiratoryBiomass = state.lineages.reduce((sum, lineage) => sum + lineage.biomass * lineage.traits.oxygenUse, 0);
  const previousOxygen = state.atmosphere.o2 * state.atmospherePressureBar;
  const burialEfficiency = clamp(0.05 + state.surface.nutrients * 0.08);
  const productionBar = oxygenicBiomass * burialEfficiency * 0.000018 * dt;
  const sinkBar = (respiratoryBiomass * 0.000005 + state.interior.volcanism * 0.000002 + state.atmosphere.ch4 * 0.000004) * dt;
  applyAtmosphereFlux(state, { o2: productionBar - sinkBar });
  const currentOxygen = state.atmosphere.o2 * state.atmospherePressureBar;
  if (previousOxygen < 0.02 && currentOxygen >= 0.02) {
    events.push({ kind: "planet", title: "Persistent atmospheric oxygen", summary: "Oxygenic production and burial began to outrun modeled redox sinks.", detail: "This transition changes metabolic opportunity while also stressing oxygen-intolerant lineages.", causes: [`Oxygenic biomass ${oxygenicBiomass.toFixed(2)}`, `Burial efficiency index ${burialEfficiency.toFixed(2)}`, `Modeled sinks ${sinkBar.toExponential(2)} bar`], effects: { oxygenPartialPressure: { before: previousOxygen, after: currentOxygen, unit: "bar" } }, affectedLineageIds: state.lineages.filter((lineage) => lineage.traits.photosynthesis > 0.72).map((lineage) => lineage.id), confidence: "coarse", modelNote: "The budget includes burial, respiration, reduced volcanic gases, and methane as aggregate proxies; photochemistry and oxidative weathering remain omitted." });
  }
  state.foodWeb = links.sort((a, b) => b.energyFlow - a.energyFlow).slice(0, 80);
  return events;
}

function stellarFluxProxy(state: SimulationState): number {
  return clamp(state.params.starLuminositySolar / Math.max(0.01, state.params.orbitalDistanceAu ** 2), 0, 2) / 2;
}

export function dominantStage(lineages: Lineage[]): LifeStage | "sterile" {
  if (!lineages.length) return "sterile";
  return lineages.reduce((best, lineage) => STAGE_RANK[lineage.stage] > STAGE_RANK[best.stage] ? lineage : best).stage;
}

export function biosphereDiagnostic(state: SimulationState): { title: string; detail: string } {
  const habitability = habitabilityScore(state);
  const readiness = prebioticReadiness(state);
  if (!state.lineages.length && habitability < 0.28) return { title: "Hostile surface", detail: "Temperature, pressure, water, or radiation prevents persistent prebiotic environments." };
  if (!state.lineages.length && readiness < 0.42) return { title: "Chemistry accumulating", detail: "Useful molecules exist, but concentration, polymers, or sustained gradients remain limiting." };
  if (!state.lineages.length) return { title: "Origin window open", detail: "Conditions permit repeated origin attempts, but success remains stochastic and is not guaranteed." };
  const stage = dominantStage(state.lineages);
  if (stage === "protocell" || stage === "simple-cell") return { title: "Microbial biosphere", detail: "Simple lineages are adapting, competing, and changing the planet's chemical cycles." };
  if (stage === "complex-cell" || stage === "colony") return { title: "Complex cells diversifying", detail: "Larger energy budgets and cooperation support new ecological strategies." };
  return { title: "Multicellular ecosystems", detail: "At least one lineage supports coordinated tissues or organ-like systems; extinction and competition remain active." };
}
