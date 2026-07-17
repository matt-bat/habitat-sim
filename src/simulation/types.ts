export type EvidenceClass = "grounded" | "coarse" | "speculative";
export type GasId = "n2" | "co2" | "h2o" | "ch4" | "o2" | "h2" | "nh3" | "so2";
export type ElementId = "carbon" | "hydrogen" | "nitrogen" | "oxygen" | "phosphorus" | "sulfur" | "iron";
export type OriginTheoryId = "pond" | "hydrothermal" | "atmospheric" | "exogenous" | "lithopanspermia" | "custom";
export type LifeStage = "protocell" | "simple-cell" | "complex-cell" | "colony" | "multicellular" | "complex-organism";
export type Metabolism = "phototroph" | "chemotroph" | "heterotroph" | "mixotroph" | "decomposer";
export type TrophicRole = "producer" | "herbivore" | "carnivore" | "omnivore" | "decomposer" | "parasite" | "generalist";
export type StructureId =
  | "membrane"
  | "genome"
  | "ribosome"
  | "cell-wall"
  | "flagellum"
  | "nucleus"
  | "mitochondrion"
  | "chloroplast"
  | "vacuole"
  | "sensory-network"
  | "digestive-system"
  | "circulatory-system"
  | "respiratory-system"
  | "locomotor-system"
  | "reproductive-system";

export type InterventionType =
  | "organic-asteroid"
  | "ice-comet"
  | "microbial-seed"
  | "fungal-spores"
  | "stellar-flare"
  | "quiet-star"
  | "volcanic-pulse"
  | "nutrient-deposition"
  | "sterilizing-impact"
  | "custom";

export type Atmosphere = Record<GasId, number>;
export type ElementalBasis = Record<ElementId, number>;

export type PlanetParams = {
  seed: string;
  starMassSolar: number;
  starLuminositySolar: number;
  starActivity: number;
  orbitalDistanceAu: number;
  planetMassEarth: number;
  planetRadiusEarth: number;
  rotationHours: number;
  axialTiltDeg: number;
  albedo: number;
  waterInventory: number;
  landFraction: number;
  coreFraction: number;
  mantleFraction: number;
  initialHeat: number;
  radionuclides: number;
  tectonicMobility: number;
  impactRate: number;
  atmospherePressureBar: number;
  atmosphere: Atmosphere;
  mutationRate: number;
  originDifficulty: number;
};

export type OriginConfig = {
  theory: OriginTheoryId;
  energy: number;
  catalysts: number;
  wetDryCycling: number;
  ventFlux: number;
  exogenousDose: number;
  recurrence: number;
  survivalFraction: number;
};

export type Intervention = {
  id: string;
  type: InterventionType;
  label: string;
  scheduledAgeMyr: number;
  magnitude: number;
  cargo: Partial<Record<ElementId | "water" | "organics" | "aminoAcids" | "nucleotides" | "microbes" | "spores", number>>;
  applied: boolean;
};

export type InteriorState = {
  heat: number;
  coreActivity: number;
  magneticShield: number;
  volcanism: number;
  tectonics: number;
  outgassing: number;
};

export type SurfaceState = {
  temperatureC: number;
  liquidWater: number;
  ice: number;
  oceanCoverage: number;
  landFraction: number;
  radiation: number;
  nutrients: number;
  hydrothermalActivity: number;
  wetDryCycling: number;
  ph: number;
};

export type ChemistryState = {
  elements: ElementalBasis;
  simpleOrganics: number;
  aminoAcids: number;
  lipids: number;
  nucleotides: number;
  polymers: number;
  protocells: number;
  redoxGradient: number;
};

export type LineageTraits = {
  temperatureOptimum: number;
  temperatureTolerance: number;
  radiationResistance: number;
  oxygenUse: number;
  photosynthesis: number;
  chemosynthesis: number;
  mobility: number;
  predation: number;
  digestion: number;
  cooperation: number;
  defense: number;
  parasitism: number;
  size: number;
  complexity: number;
  reproduction: number;
};

export type DietRecord = {
  light: number;
  minerals: number;
  producers: number;
  prey: number;
  detritus: number;
};

export type Lineage = {
  id: string;
  name: string;
  ancestorId: string | null;
  bornAtMyr: number;
  generation: number;
  stage: LifeStage;
  metabolism: Metabolism;
  trophicRole: TrophicRole;
  population: number;
  biomass: number;
  fitness: number;
  habitat: string;
  traits: LineageTraits;
  structures: StructureId[];
  elements: ElementalBasis;
  diet: DietRecord;
  capabilities: string[];
  preyIds: string[];
};

export type FoodWebLink = {
  sourceId: string;
  targetId: string;
  relation: "predation" | "grazing" | "competition" | "mutualism" | "parasitism" | "decomposition";
  energyFlow: number;
};

export type StateDelta = {
  before: number | string;
  after: number | string;
  unit?: string;
};

export type TimelineEvent = {
  id: string;
  ageMyr: number;
  kind: "planet" | "chemistry" | "origin" | "evolution" | "ecology" | "intervention" | "extinction";
  title: string;
  summary: string;
  detail: string;
  causes: string[];
  effects: Record<string, StateDelta>;
  affectedLineageIds: string[];
  confidence: EvidenceClass;
  modelNote: string;
};

export type PlanetSnapshot = {
  ageMyr: number;
  temperatureC: number;
  pressureBar: number;
  oxygen: number;
  liquidWater: number;
  prebioticReadiness: number;
  lineages: number;
  population: number;
  dominantStage: LifeStage | "sterile";
};

export type SimulationState = {
  params: PlanetParams;
  origin: OriginConfig;
  ageMyr: number;
  interior: InteriorState;
  atmosphere: Atmosphere;
  atmospherePressureBar: number;
  surface: SurfaceState;
  chemistry: ChemistryState;
  lineages: Lineage[];
  foodWeb: FoodWebLink[];
  interventions: Intervention[];
  timeline: TimelineEvent[];
  snapshots: PlanetSnapshot[];
  appliedInterventionCount: number;
  failedOriginAttempts: number;
  extinctionCount: number;
};

export type SimulationSummary = {
  seed: string;
  ageMyr: number;
  state: SimulationState;
  habitabilityScore: number;
  habitableZoneFlux: number;
  habitableZoneStatus: "inner-hot" | "temperate-flux" | "outer-cold";
  prebioticReadiness: number;
  biosphereStatus: string;
  dominantStage: LifeStage | "sterile";
  totalPopulation: number;
  totalBiomass: number;
  biodiversity: number;
  oxygenPercent: number;
  diagnostic: { title: string; detail: string };
};

