import { clamp } from "./random";
import { applyAtmosphereFlux, atmospherePartialPressures } from "./planet";
import { createSeededLineage, type EventDraft } from "./life";
import type { ElementId, Intervention, SimulationState } from "./types";

const ELEMENT_KEYS: ElementId[] = ["carbon", "hydrogen", "nitrogen", "oxygen", "phosphorus", "sulfur", "iron"];

export function applyIntervention(state: SimulationState, intervention: Intervention, random: () => number): EventDraft {
  const magnitude = clamp(intervention.magnitude, 0.01, 1);
  const before = {
    temperature: state.surface.temperatureC,
    pressure: state.atmospherePressureBar,
    water: state.surface.liquidWater,
    radiation: state.surface.radiation,
    organics: state.chemistry.simpleOrganics,
    nutrients: state.surface.nutrients,
    lineages: state.lineages.length,
    population: state.lineages.reduce((sum, lineage) => sum + lineage.population, 0)
  };
  let confidence: EventDraft["confidence"] = "coarse";
  let detail = "The event altered coupled planetary reservoirs.";

  if (intervention.type === "organic-asteroid") {
    state.chemistry.simpleOrganics = clamp(state.chemistry.simpleOrganics + magnitude * 0.34 + Number(intervention.cargo.organics || 0) * 0.4, 0, 3);
    state.chemistry.aminoAcids = clamp(state.chemistry.aminoAcids + magnitude * 0.16 + Number(intervention.cargo.aminoAcids || 0) * 0.45, 0, 2);
    state.chemistry.nucleotides = clamp(state.chemistry.nucleotides + magnitude * 0.05 + Number(intervention.cargo.nucleotides || 0) * 0.3, 0, 2);
    state.surface.temperatureC += magnitude * 11;
    state.surface.nutrients = clamp(state.surface.nutrients + magnitude * 0.09);
    confidence = "grounded";
    detail = "Carbonaceous impactors can deliver diverse organic inventory, but entry heating, shock, dilution, and subsequent chemistry control usefulness.";
  } else if (intervention.type === "ice-comet") {
    state.params.waterInventory = clamp(state.params.waterInventory + magnitude * 0.18, 0, 1.5);
    state.surface.liquidWater = clamp(state.surface.liquidWater + magnitude * 0.12);
    state.chemistry.simpleOrganics = clamp(state.chemistry.simpleOrganics + magnitude * 0.08, 0, 3);
    state.surface.temperatureC += magnitude * 7;
    confidence = "grounded";
    detail = "An icy impact adds volatiles and some organics while also imposing a heat and shock pulse.";
  } else if (intervention.type === "microbial-seed") {
    confidence = "speculative";
    const survival = clamp(intervention.cargo.microbes || state.origin.survivalFraction) * (1 - state.surface.radiation) * state.surface.liquidWater;
    if (random() < survival * magnitude && state.surface.temperatureC > -15 && state.surface.temperatureC < 85) {
      state.lineages.push(createSeededLineage(state, random, "microbial"));
      detail = "Viable cells survived delivery in this speculative scenario and entered an environment compatible with short-term metabolism.";
    } else {
      detail = "No introduced microbial population survived shock, radiation, temperature, and solvent exposure.";
    }
  } else if (intervention.type === "fungal-spores") {
    confidence = "speculative";
    const hasFood = state.lineages.some((lineage) => lineage.biomass > 0.001) || state.chemistry.simpleOrganics > 0.7;
    const viableEnvironment = state.atmosphere.o2 * state.atmospherePressureBar > 0.07 && state.surface.liquidWater > 0.3 && state.surface.temperatureC > -5 && state.surface.temperatureC < 48 && hasFood;
    if (viableEnvironment && random() < clamp(intervention.cargo.spores || 0.15) * magnitude) {
      state.lineages.push(createSeededLineage(state, random, "spores"));
      detail = "A small introduced spore population established because oxygen, water, temperature, and organic food were already available.";
    } else {
      detail = "The introduced spores failed; fungi-like life requires an already suitable oxygenated ecosystem and available organic food in this model.";
    }
  } else if (intervention.type === "stellar-flare") {
    state.surface.radiation = clamp(state.surface.radiation + magnitude * 0.65);
    const partials = atmospherePartialPressures(state.atmosphere, state.atmospherePressureBar);
    const escapeFraction = magnitude * 0.08 / Math.max(0.25, state.params.planetMassEarth / state.params.planetRadiusEarth ** 2);
    applyAtmosphereFlux(state, Object.fromEntries(Object.entries(partials).map(([gas, pressure]) => [gas, -pressure * escapeFraction])));
    for (const lineage of state.lineages) lineage.population *= clamp(1 - magnitude * Math.max(0, state.surface.radiation - lineage.traits.radiationResistance) * 0.32);
    detail = "A flare raised surface radiation, drove gravity- and column-dependent atmospheric loss, and selected for shielding, repair, or refugia.";
  } else if (intervention.type === "quiet-star") {
    state.params.starActivity = clamp(state.params.starActivity * (1 - magnitude * 0.7));
    state.surface.radiation = clamp(state.surface.radiation * (1 - magnitude * 0.6));
    detail = "A sustained quiet interval reduced ionizing and particle radiation pressure on the atmosphere and biosphere.";
  } else if (intervention.type === "volcanic-pulse") {
    state.interior.volcanism = clamp(state.interior.volcanism + magnitude * 0.45);
    applyAtmosphereFlux(state, { co2: magnitude * 0.08, so2: magnitude * 0.06 });
    state.surface.temperatureC += magnitude * 8;
    state.surface.nutrients = clamp(state.surface.nutrients + magnitude * 0.12);
    detail = "Volcanism supplied gases and nutrients while adding short-lived aerosols, heat, and environmental stress.";
  } else if (intervention.type === "nutrient-deposition") {
    state.surface.nutrients = clamp(state.surface.nutrients + magnitude * 0.42);
    state.chemistry.elements.phosphorus = clamp(state.chemistry.elements.phosphorus + magnitude * 0.22);
    state.chemistry.elements.iron = clamp(state.chemistry.elements.iron + magnitude * 0.18);
    confidence = "grounded";
    detail = "Bioavailable phosphorus, iron, and minerals expanded primary-production and prebiotic opportunities.";
  } else if (intervention.type === "sterilizing-impact") {
    state.surface.temperatureC += magnitude * 75;
    state.surface.radiation = clamp(state.surface.radiation + magnitude * 0.18);
    for (const lineage of state.lineages) {
      const refuge = lineage.habitat.includes("deep") || lineage.habitat.includes("hydrothermal") ? 0.58 : 0.08;
      lineage.population *= clamp(1 - magnitude * (1 - refuge));
    }
    detail = "A high-energy impact caused severe heating and mortality; deep or subsurface refugia reduced losses for some lineages.";
  } else {
    state.params.waterInventory = clamp(state.params.waterInventory + Number(intervention.cargo.water || 0) * magnitude * 0.1, 0, 1.5);
    state.chemistry.simpleOrganics = clamp(state.chemistry.simpleOrganics + Number(intervention.cargo.organics || 0) * magnitude * 0.2, 0, 3);
    state.chemistry.aminoAcids = clamp(state.chemistry.aminoAcids + Number(intervention.cargo.aminoAcids || 0) * magnitude * 0.2, 0, 2);
    state.chemistry.nucleotides = clamp(state.chemistry.nucleotides + Number(intervention.cargo.nucleotides || 0) * magnitude * 0.16, 0, 2);
    detail = "A user-defined cargo changed explicitly selected reservoirs; effects use coarse bounded transfer factors.";
    confidence = "speculative";
  }

  for (const element of ELEMENT_KEYS) {
    const cargo = Number(intervention.cargo[element] || 0);
    if (cargo > 0) state.chemistry.elements[element] = clamp(state.chemistry.elements[element] + cargo * magnitude * 0.2);
  }
  intervention.applied = true;
  state.appliedInterventionCount += 1;

  const afterPopulation = state.lineages.reduce((sum, lineage) => sum + lineage.population, 0);
  return {
    kind: "intervention",
    title: intervention.label,
    summary: `${intervention.type.replaceAll("-", " ")} applied at magnitude ${Math.round(magnitude * 100)}%.`,
    detail,
    causes: [`Scheduled experiment intervention`, `Cargo fields: ${Object.keys(intervention.cargo).join(", ") || "none"}`],
    effects: {
      temperature: { before: before.temperature, after: state.surface.temperatureC, unit: "°C" },
      pressure: { before: before.pressure, after: state.atmospherePressureBar, unit: "bar" },
      liquidWater: { before: before.water, after: state.surface.liquidWater },
      radiation: { before: before.radiation, after: state.surface.radiation },
      organics: { before: before.organics, after: state.chemistry.simpleOrganics },
      nutrients: { before: before.nutrients, after: state.surface.nutrients },
      lineages: { before: before.lineages, after: state.lineages.length },
      population: { before: Math.round(before.population), after: Math.round(afterPopulation) }
    },
    affectedLineageIds: state.lineages.map((lineage) => lineage.id),
    confidence,
    modelNote: confidence === "speculative" ? "This intervention explores an unresolved or artificial scenario." : "Effects preserve direction and tradeoffs but compress real impact physics and chemistry."
  };
}

export function defaultIntervention(type: Intervention["type"], ageMyr: number, sequence: number): Intervention {
  const labels: Record<Intervention["type"], string> = {
    "organic-asteroid": "Carbonaceous asteroid",
    "ice-comet": "Ice-rich comet",
    "microbial-seed": "Protected microbial inoculum",
    "fungal-spores": "Speculative fungal spore delivery",
    "stellar-flare": "Severe stellar flare",
    "quiet-star": "Stellar quiet interval",
    "volcanic-pulse": "Flood-basalt volcanic pulse",
    "nutrient-deposition": "Phosphorus and iron deposition",
    "sterilizing-impact": "Basin-forming impact",
    custom: "Custom intervention"
  };
  const cargo: Intervention["cargo"] = type === "organic-asteroid"
    ? { organics: 0.8, aminoAcids: 0.55, nucleotides: 0.2, carbon: 0.6, phosphorus: 0.18 }
    : type === "ice-comet" ? { water: 0.9, organics: 0.18 }
      : type === "microbial-seed" ? { microbes: 0.18 }
        : type === "fungal-spores" ? { spores: 0.12 }
          : type === "nutrient-deposition" ? { phosphorus: 0.75, iron: 0.65 }
            : {};
  return { id: `int-${sequence}-${Math.round(ageMyr * 10)}`, type, label: labels[type], scheduledAgeMyr: Math.max(0, ageMyr), magnitude: 0.65, cargo, applied: false };
}
