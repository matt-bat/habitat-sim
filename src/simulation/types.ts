export type EvidenceClass = "grounded" | "coarse" | "speculative";
export type GasId = "n2" | "co2" | "h2o" | "ch4" | "o2" | "h2" | "nh3" | "so2";
export type ElementId = "carbon" | "hydrogen" | "nitrogen" | "oxygen" | "phosphorus" | "sulfur" | "iron";
export type OriginTheoryId = "pond" | "rna-first" | "hydrothermal" | "atmospheric" | "uv-network" | "ice-eutectic" | "mineral-template" | "lipid-first" | "exogenous" | "lithopanspermia" | "custom";
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
  | "reproductive-system"
  | "osmoregulatory-system"
  | "support-system"
  | "excretory-system"
  | "immune-system"
  | "neural-system";

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

export type ScenarioCategory = "earth-history" | "plausible" | "experimental" | "user";
export type ModelFit = "native" | "proxy" | "outside-model";
export type StarTopology = "single" | "circumbinary" | "hierarchical-triple";

export type PlanetParams = {
  seed: string;
  biochemistryMode: "aqueous-carbon" | "unsupported-alternative";
  starCount: number;
  starTopology: StarTopology;
  starMassSolar: number;
  starLuminositySolar: number;
  starTemperatureK: number;
  starActivity: number;
  starAgeGyr: number;
  companionMassSolar: number;
  companionLuminositySolar: number;
  companionTemperatureK: number;
  companionDistanceAu: number;
  companionVariability: number;
  orbitalDistanceAu: number;
  orbitalEccentricity: number;
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
  elementBasis: ElementalBasis;
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

export type PlannedIntervention = Omit<Intervention, "id" | "applied">;

export type ScientificSource = {
  id: string;
  title: string;
  attribution: string;
  year: number;
  url: string;
  kind: "primary" | "review" | "reference";
};

export type ScenarioDefinition = {
  schemaVersion: 1;
  modelVersion: "1.1";
  id: string;
  label: string;
  subtitle: string;
  description: string;
  category: Exclude<ScenarioCategory, "user">;
  evidence: EvidenceClass;
  modelFit: ModelFit;
  confidenceNote: string;
  tags: string[];
  sourceIds: string[];
  caveats: string[];
  params: Partial<PlanetParams>;
  origin: Partial<OriginConfig>;
  interventions: PlannedIntervention[];
};

export type ScenarioConfiguration = {
  seed: string;
  params: PlanetParams;
  origin: OriginConfig;
  interventions: PlannedIntervention[];
  runHorizonMyr: number;
};

export type UserPreset = {
  schemaVersion: 1;
  modelVersion: "1.1";
  id: string;
  ownership: "user";
  name: string;
  description: string;
  category: "user";
  evidence: EvidenceClass;
  basePresetId?: string;
  createdAt: string;
  updatedAt: string;
  configuration: ScenarioConfiguration;
};

export type WizardDraft = {
  schemaVersion: 1;
  sourcePresetId: string;
  selectedCategory: ScenarioCategory | "all";
  configuration: ScenarioConfiguration;
  dirty: boolean;
  updatedAt: string;
};

export type GuidanceTone = "positive" | "attention" | "critical" | "neutral";
export type ScienceGuidance = {
  id: string;
  title: string;
  summary: string;
  causalChain: string;
  evidence: EvidenceClass;
  tone: GuidanceTone;
  sourceIds: string[];
  modelBoundary: string;
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
  detritusBiomass: number;
};

export type LimitingFactor = {
  id: "thermal" | "water" | "radiation" | "pressure" | "building-blocks" | "gradients" | "energy" | "nutrients";
  label: string;
  score: number;
  detail: string;
  counterfactual: string;
  confidence: EvidenceClass;
};

export type PlanetObservables = {
  gravityEarth: number;
  escapeVelocityKmS: number;
  bulkDensityGcm3: number;
  orbitalPeriodDays: number;
  periapsisAu: number;
  apoapsisAu: number;
  periapsisFlux: number;
  apoapsisFlux: number;
  primaryStellarFlux: number;
  companionStellarFlux: number;
  companionFluxFraction: number;
  multiStarVariabilityIndex: number;
  stellarArchitecture: StarTopology;
  orbitalForcingAmplitude: number;
  solarDayHours: number;
  rotationOrbitRatio: number;
  equilibriumTemperatureC: number;
  greenhouseDeltaC: number;
  absorbedStellarWm2: number;
  effectiveAlbedo: number;
  cloudCoverIndex: number;
  hydrologicalCycleIndex: number;
  climateBufferIndex: number;
  climateRegime: "snowball" | "cold-arid" | "temperate" | "warm-humid" | "moist-greenhouse" | "hothouse";
  snowballRisk: number;
  runawayGreenhouseRisk: number;
  atmosphericCollapseRisk: number;
  habitableZoneInnerFlux: number;
  habitableZoneOuterFlux: number;
  stellarClass: "M" | "K" | "G" | "F" | "A";
  stellarMainSequenceLifetimeGyr: number;
  stellarAgeFraction: number;
  highEnergyFluxIndex: number;
  photosyntheticPhotonIndex: number;
  atmosphericRetentionIndex: number;
  climateStabilityIndex: number;
  redoxDisequilibriumIndex: number;
  tidalLockingRisk: "low" | "moderate" | "high";
  tectonicRegime: "stagnant lid" | "episodic lid" | "mobile lid";
  internalHeatFluxIndex: number;
  weatheringFluxIndex: number;
  seafloorWeatheringIndex: number;
  outgassingFluxIndex: number;
  carbonCycleBalance: number;
  phosphorusAccess: number;
  nitrogenAccess: number;
  ironAccess: number;
  abioticOxygenRisk: number;
  greenhouseContributionsC: Partial<Record<GasId | "pressure", number>>;
  oxygenicProduction: number;
  oxygenSinks: number;
};

export type OriginGateId = "feedstock" | "energy" | "concentration" | "catalysis" | "compartment" | "heredity";

export type OriginGate = {
  id: OriginGateId;
  label: string;
  score: number;
  detail: string;
  confidence: EvidenceClass;
};

export type OriginDiagnostics = {
  gates: OriginGate[];
  limitingGate: OriginGate;
  readiness: number;
  degradationPressure: number;
  opportunityRatePerMyr: number;
  deliverySurvivalIndex: number;
};

export type EcosystemDiagnostics = {
  shannonDiversity: number;
  evenness: number;
  foodWebConnectance: number;
  meanTrophicLevel: number;
  primaryProductivityIndex: number;
  recyclingEfficiency: number;
  extinctionPressure: number;
  ecologicalComplexity: number;
};

export type LineageDiagnostics = {
  environmentalFit: number;
  energyAcquisition: number;
  maintenanceBurden: number;
  realizedEnergy: number;
  nicheBreadth: number;
  selectionPressure: number;
  trophicLevel: number;
  ecologicalImpact: number;
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
  observables: PlanetObservables;
  originDiagnostics: OriginDiagnostics;
  ecosystem: EcosystemDiagnostics;
  lineageDiagnostics: Record<string, LineageDiagnostics>;
  limitingFactors: LimitingFactor[];
  diagnostic: { title: string; detail: string };
};
