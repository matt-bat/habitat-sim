import { PARAMETER_FIELDS } from "./parameters";
import type { ElementalBasis, OriginConfig, PlanetParams, StructureId } from "./types";

export const DEFAULT_ELEMENTS: ElementalBasis = {
  carbon: 0.58,
  hydrogen: 0.78,
  nitrogen: 0.42,
  oxygen: 0.72,
  phosphorus: 0.18,
  sulfur: 0.28,
  iron: 0.46
};

export const DEFAULT_PARAMS: PlanetParams = {
  seed: "",
  biochemistryMode: "aqueous-carbon",
  starCount: 1,
  starTopology: "single",
  starMassSolar: 1,
  starLuminositySolar: 1,
  starTemperatureK: 5778,
  starActivity: 0.28,
  starAgeGyr: 4.6,
  companionMassSolar: 0.72,
  companionLuminositySolar: 0.22,
  companionTemperatureK: 4400,
  companionDistanceAu: 5,
  companionVariability: 0.15,
  orbitalDistanceAu: 1,
  orbitalEccentricity: 0.0167,
  planetMassEarth: 1,
  planetRadiusEarth: 1,
  rotationHours: 24,
  axialTiltDeg: 23.4,
  albedo: 0.3,
  waterInventory: 0.72,
  landFraction: 0.3,
  coreFraction: 0.32,
  mantleFraction: 0.67,
  initialHeat: 0.78,
  radionuclides: 0.62,
  tectonicMobility: 0.66,
  impactRate: 0.34,
  atmospherePressureBar: 1,
  atmosphere: { n2: 0.72, co2: 0.12, h2o: 0.08, ch4: 0.035, o2: 0.005, h2: 0.02, nh3: 0.01, so2: 0.01 },
  elementBasis: { ...DEFAULT_ELEMENTS },
  mutationRate: 0.42,
  originDifficulty: 0.58
};

export const DEFAULT_ORIGIN: OriginConfig = {
  theory: "pond",
  energy: 0.62,
  catalysts: 0.54,
  wetDryCycling: 0.72,
  ventFlux: 0.3,
  exogenousDose: 0.2,
  recurrence: 0.35,
  survivalFraction: 0.02
};

export const ORIGIN_PRESETS: Record<string, OriginConfig & { label: string; description: string; evidence: "grounded" | "coarse" | "speculative" }> = {
  pond: { ...DEFAULT_ORIGIN, theory: "pond", label: "Wet-dry ponds", description: "Concentration and polymerization in repeated surface cycles.", evidence: "coarse" },
  "rna-first": { ...DEFAULT_ORIGIN, theory: "rna-first", energy: 0.64, catalysts: 0.7, wetDryCycling: 0.7, ventFlux: 0.15, label: "RNA-first heredity", description: "Nucleotide formation, polymer persistence, and ribozyme-like heredity in concentrating environments.", evidence: "speculative" },
  hydrothermal: { ...DEFAULT_ORIGIN, theory: "hydrothermal", energy: 0.72, catalysts: 0.84, ventFlux: 0.92, wetDryCycling: 0.05, label: "Hydrothermal gradients", description: "Mineral pores and redox gradients around active vents.", evidence: "coarse" },
  atmospheric: { ...DEFAULT_ORIGIN, theory: "atmospheric", energy: 0.9, catalysts: 0.28, wetDryCycling: 0.44, label: "Atmospheric energy", description: "Lightning and ultraviolet energy build organics in a reactive atmosphere.", evidence: "coarse" },
  "uv-network": { ...DEFAULT_ORIGIN, theory: "uv-network", energy: 0.94, catalysts: 0.58, wetDryCycling: 0.62, ventFlux: 0.1, label: "UV cyanosulfidic network", description: "Ultraviolet-driven reaction networks couple sulfur-bearing feedstocks to precursor synthesis.", evidence: "speculative" },
  "ice-eutectic": { ...DEFAULT_ORIGIN, theory: "ice-eutectic", energy: 0.34, catalysts: 0.5, wetDryCycling: 0.12, label: "Ice eutectic pockets", description: "Freezing excludes solutes into concentrated liquid films and protects fragile products.", evidence: "speculative" },
  "mineral-template": { ...DEFAULT_ORIGIN, theory: "mineral-template", energy: 0.5, catalysts: 0.94, wetDryCycling: 0.58, label: "Mineral templates", description: "Reactive mineral surfaces adsorb, organize, and catalyze molecular building blocks.", evidence: "speculative" },
  "lipid-first": { ...DEFAULT_ORIGIN, theory: "lipid-first", energy: 0.48, catalysts: 0.52, wetDryCycling: 0.68, label: "Lipid-first compartments", description: "Amphiphile-rich cycles favor self-assembled boundaries before robust heredity.", evidence: "speculative" },
  exogenous: { ...DEFAULT_ORIGIN, theory: "exogenous", exogenousDose: 0.9, recurrence: 0.72, label: "Exogenous organics", description: "Asteroids and comets deliver water and prebiotic molecules.", evidence: "grounded" },
  lithopanspermia: { ...DEFAULT_ORIGIN, theory: "lithopanspermia", exogenousDose: 0.65, survivalFraction: 0.12, label: "Lithopanspermia", description: "Rare viable microbes arrive protected inside rock.", evidence: "speculative" },
  custom: { ...DEFAULT_ORIGIN, theory: "custom", label: "Custom protocol", description: "Blend energy, catalysts, cycles, delivery, and survival assumptions.", evidence: "speculative" }
};

export const STRUCTURE_INFO: Record<StructureId, { label: string; capability: string; cost: number; evidence: "grounded" | "coarse" }> = {
  membrane: { label: "Selective membrane", capability: "Maintains chemical gradients", cost: 0.03, evidence: "grounded" },
  genome: { label: "Heritable polymer", capability: "Stores inheritable variation", cost: 0.04, evidence: "coarse" },
  ribosome: { label: "Translation machinery", capability: "Builds functional polymers", cost: 0.05, evidence: "coarse" },
  "cell-wall": { label: "Cell wall", capability: "Resists osmotic and physical stress", cost: 0.03, evidence: "grounded" },
  flagellum: { label: "Motility apparatus", capability: "Moves toward resources", cost: 0.08, evidence: "coarse" },
  nucleus: { label: "Nucleus-like compartment", capability: "Protects and regulates a larger genome", cost: 0.1, evidence: "coarse" },
  mitochondrion: { label: "Mitochondrion-like symbiont", capability: "Raises aerobic energy budget", cost: 0.09, evidence: "grounded" },
  chloroplast: { label: "Chloroplast-like symbiont", capability: "Captures light and releases oxidants", cost: 0.08, evidence: "grounded" },
  vacuole: { label: "Storage vacuole", capability: "Stores water, ions, and metabolites", cost: 0.04, evidence: "grounded" },
  "sensory-network": { label: "Sensory network", capability: "Coordinates responses to food and hazards", cost: 0.14, evidence: "coarse" },
  "digestive-system": { label: "Digestive system", capability: "Processes varied solid food", cost: 0.16, evidence: "coarse" },
  "circulatory-system": { label: "Transport system", capability: "Moves gases and nutrients through a large body", cost: 0.18, evidence: "coarse" },
  "respiratory-system": { label: "Respiratory surface", capability: "Improves environmental gas exchange", cost: 0.14, evidence: "coarse" },
  "locomotor-system": { label: "Locomotor system", capability: "Pursues food or escapes predators", cost: 0.2, evidence: "coarse" },
  "reproductive-system": { label: "Specialized reproduction", capability: "Protects and disperses offspring", cost: 0.17, evidence: "coarse" },
  "osmoregulatory-system": { label: "Osmoregulatory system", capability: "Controls internal water and ion balance", cost: 0.12, evidence: "coarse" },
  "support-system": { label: "Structural support system", capability: "Supports larger bodies against gravity and motion", cost: 0.16, evidence: "coarse" },
  "excretory-system": { label: "Waste-processing system", capability: "Removes metabolic waste and stabilizes internal chemistry", cost: 0.14, evidence: "coarse" },
  "immune-system": { label: "Immune defense network", capability: "Recognizes and contains parasites or damaged tissue", cost: 0.15, evidence: "coarse" },
  "neural-system": { label: "Central information network", capability: "Integrates sensation, memory, and coordinated action", cost: 0.24, evidence: "coarse" }
};

/** Canonical numeric bounds are authored once in the parameter registry used by every editor. */
export const PARAM_BOUNDS = Object.fromEntries(
  PARAMETER_FIELDS.map((field) => [field.key, [field.min, field.max] as [number, number]])
) as Partial<Record<keyof PlanetParams, [number, number]>>;
