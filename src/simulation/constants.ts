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
  starMassSolar: 1,
  starLuminositySolar: 1,
  starActivity: 0.28,
  orbitalDistanceAu: 1,
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

export const PLANET_PRESETS: Record<string, { label: string; description: string; params: Partial<PlanetParams>; origin?: Partial<OriginConfig> }> = {
  earthlike: { label: "Temperate analogue", description: "Balanced water, active interior, and a mild young star.", params: {} },
  ocean: { label: "Pelagic world", description: "Deep ocean with scarce land and weak wet-dry cycling.", params: { waterInventory: 1.15, landFraction: 0.06, atmospherePressureBar: 1.6, tectonicMobility: 0.45 }, origin: { theory: "hydrothermal", ventFlux: 0.88, wetDryCycling: 0.08 } },
  arid: { label: "Arid mineral world", description: "Sparse water, broad land, and intense surface cycling.", params: { waterInventory: 0.2, landFraction: 0.78, albedo: 0.36, atmospherePressureBar: 0.62 }, origin: { theory: "pond", wetDryCycling: 0.92 } },
  reducing: { label: "Reducing atmosphere", description: "Hydrogen, methane, and ammonia favor atmospheric chemistry.", params: { atmospherePressureBar: 1.35, atmosphere: { n2: 0.45, co2: 0.08, h2o: 0.1, ch4: 0.16, o2: 0.001, h2: 0.13, nh3: 0.06, so2: 0.01 } }, origin: { theory: "atmospheric", energy: 0.86 } },
  stagnant: { label: "Stagnant-lid world", description: "Weak recycling and a slowly fading dynamo.", params: { tectonicMobility: 0.08, initialHeat: 0.58, radionuclides: 0.34, coreFraction: 0.24, starActivity: 0.38 } },
  mdwarf: { label: "Active red-star world", description: "Close orbit with strong flare exposure and tidal rotation.", params: { starMassSolar: 0.34, starLuminositySolar: 0.04, starActivity: 0.9, orbitalDistanceAu: 0.2, rotationHours: 240, atmospherePressureBar: 1.8, coreFraction: 0.38 } }
};

export const ORIGIN_PRESETS: Record<string, OriginConfig & { label: string; description: string; evidence: "grounded" | "coarse" | "speculative" }> = {
  pond: { ...DEFAULT_ORIGIN, theory: "pond", label: "Wet-dry ponds", description: "Concentration and polymerization in repeated surface cycles.", evidence: "coarse" },
  hydrothermal: { ...DEFAULT_ORIGIN, theory: "hydrothermal", energy: 0.72, catalysts: 0.84, ventFlux: 0.92, wetDryCycling: 0.05, label: "Hydrothermal gradients", description: "Mineral pores and redox gradients around active vents.", evidence: "coarse" },
  atmospheric: { ...DEFAULT_ORIGIN, theory: "atmospheric", energy: 0.9, catalysts: 0.28, wetDryCycling: 0.44, label: "Atmospheric energy", description: "Lightning and ultraviolet energy build organics in a reactive atmosphere.", evidence: "coarse" },
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
  "reproductive-system": { label: "Specialized reproduction", capability: "Protects and disperses offspring", cost: 0.17, evidence: "coarse" }
};

export const PARAM_BOUNDS: Partial<Record<keyof PlanetParams, [number, number]>> = {
  starMassSolar: [0.1, 2], starLuminositySolar: [0.003, 8], starActivity: [0, 1], orbitalDistanceAu: [0.03, 4],
  planetMassEarth: [0.2, 5], planetRadiusEarth: [0.5, 2], rotationHours: [4, 1000], axialTiltDeg: [0, 90], albedo: [0.05, 0.75],
  waterInventory: [0, 1.5], landFraction: [0, 0.95], coreFraction: [0.05, 0.7], mantleFraction: [0.2, 0.9], initialHeat: [0, 1],
  radionuclides: [0, 1], tectonicMobility: [0, 1], impactRate: [0, 1], atmospherePressureBar: [0.01, 20], mutationRate: [0.02, 1], originDifficulty: [0.05, 1]
};
