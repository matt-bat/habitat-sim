import { DEFAULT_ORIGIN, DEFAULT_PARAMS } from "./constants";
import { biosphereDiagnostic, dominantStage, evolveLife, type EventDraft } from "./life";
import { applyIntervention, defaultIntervention } from "./interventions";
import { clamp, hashString, makeRandom } from "./random";
import {
  habitableZoneStatus,
  habitabilityScore,
  limitingFactors,
  makeChemistry,
  makeInterior,
  makeSurface,
  normalizeAtmosphere,
  normalizeParams,
  planetObservables,
  prebioticReadiness,
  stellarFlux,
  updatePlanet
} from "./planet";
import type { Intervention, InterventionType, OriginConfig, PlanetParams, PlanetSnapshot, SimulationState, SimulationSummary, TimelineEvent } from "./types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasFiniteFields(value: unknown, fields: string[]): value is UnknownRecord {
  return isRecord(value) && fields.every((field) => typeof value[field] === "number" && Number.isFinite(value[field]));
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFiniteValueRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((item) => typeof item === "number" && Number.isFinite(item));
}

function isValidLineage(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const strings = ["id", "name", "stage", "metabolism", "trophicRole", "habitat"];
  const numbers = ["bornAtMyr", "generation", "population", "biomass", "fitness"];
  return strings.every((field) => typeof value[field] === "string")
    && numbers.every((field) => typeof value[field] === "number" && Number.isFinite(value[field]))
    && (value.ancestorId === null || typeof value.ancestorId === "string")
    && isFiniteValueRecord(value.traits)
    && isFiniteValueRecord(value.elements)
    && isFiniteValueRecord(value.diet)
    && isStringArray(value.structures)
    && isStringArray(value.capabilities)
    && isStringArray(value.preyIds);
}

function isValidTimelineEvent(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const strings = ["id", "kind", "title", "summary", "detail", "confidence", "modelNote"];
  const effectsValid = isRecord(value.effects) && Object.values(value.effects).every((effect) => {
    if (!isRecord(effect)) return false;
    const validDelta = (item: unknown) => typeof item === "string" || (typeof item === "number" && Number.isFinite(item));
    return validDelta(effect.before) && validDelta(effect.after) && (effect.unit === undefined || typeof effect.unit === "string");
  });
  return strings.every((field) => typeof value[field] === "string")
    && typeof value.ageMyr === "number" && Number.isFinite(value.ageMyr)
    && isStringArray(value.causes)
    && isStringArray(value.affectedLineageIds)
    && effectsValid;
}

function isValidIntervention(value: unknown): boolean {
  return isRecord(value)
    && ["id", "type", "label"].every((field) => typeof value[field] === "string")
    && ["scheduledAgeMyr", "magnitude"].every((field) => typeof value[field] === "number" && Number.isFinite(value[field]))
    && typeof value.applied === "boolean"
    && isFiniteValueRecord(value.cargo);
}

function assertImportShape(state: UnknownRecord): void {
  const numericRecords: Array<[string, string[]]> = [
    ["interior", ["heat", "coreActivity", "magneticShield", "volcanism", "tectonics", "outgassing"]],
    ["surface", ["temperatureC", "liquidWater", "ice", "oceanCoverage", "landFraction", "radiation", "nutrients", "hydrothermalActivity", "wetDryCycling", "ph"]]
  ];
  for (const [field, keys] of numericRecords) {
    if (state[field] !== undefined && !hasFiniteFields(state[field], keys)) throw new Error(`Invalid imported ${field}.`);
  }
  if (state.chemistry !== undefined) {
    const chemistry = state.chemistry;
    const fields = ["simpleOrganics", "aminoAcids", "lipids", "nucleotides", "polymers", "protocells", "redoxGradient"];
    if (!hasFiniteFields(chemistry, fields) || !isFiniteValueRecord(chemistry.elements)) throw new Error("Invalid imported chemistry.");
  }
  const arrays: Array<[string, (value: unknown) => boolean]> = [
    ["lineages", isValidLineage],
    ["timeline", isValidTimelineEvent],
    ["interventions", isValidIntervention],
    ["foodWeb", (value) => hasFiniteFields(value, ["energyFlow"]) && ["sourceId", "targetId", "relation"].every((field) => typeof value[field] === "string")],
    ["snapshots", (value) => hasFiniteFields(value, ["ageMyr", "temperatureC", "pressureBar", "oxygen", "liquidWater", "prebioticReadiness", "lineages", "population"]) && typeof value.dominantStage === "string"]
  ];
  for (const [field, validator] of arrays) {
    if (state[field] !== undefined && (!Array.isArray(state[field]) || !state[field].every(validator))) throw new Error(`Invalid imported ${field}.`);
  }
}

function normalizeOrigin(input?: Partial<OriginConfig>): OriginConfig {
  const origin = { ...DEFAULT_ORIGIN, ...input };
  origin.energy = clamp(Number(origin.energy));
  origin.catalysts = clamp(Number(origin.catalysts));
  origin.wetDryCycling = clamp(Number(origin.wetDryCycling));
  origin.ventFlux = clamp(Number(origin.ventFlux));
  origin.exogenousDose = clamp(Number(origin.exogenousDose));
  origin.recurrence = clamp(Number(origin.recurrence));
  origin.survivalFraction = clamp(Number(origin.survivalFraction));
  return origin;
}

function totalPopulation(state: SimulationState): number {
  return state.lineages.reduce((sum, lineage) => sum + lineage.population, 0);
}

function totalBiomass(state: SimulationState): number {
  return state.lineages.reduce((sum, lineage) => sum + lineage.biomass, 0);
}

export class HabitatSimulation {
  state: SimulationState;
  private random: () => number;
  private eventSequence = 0;
  private interventionSequence = 0;
  private lastSnapshotAge = -100;

  constructor(seed: string, params?: Partial<PlanetParams>, origin?: Partial<OriginConfig>) {
    const normalizedParams = normalizeParams({ ...DEFAULT_PARAMS, ...params, seed: seed || params?.seed || "habitat-seed" });
    const atmosphere = normalizeAtmosphere(normalizedParams.atmosphere);
    normalizedParams.atmosphere = atmosphere;
    const surface = makeSurface(normalizedParams, atmosphere);
    this.random = makeRandom(`${normalizedParams.seed}:${JSON.stringify(normalizedParams)}:${JSON.stringify(origin || DEFAULT_ORIGIN)}`);
    this.state = {
      params: normalizedParams,
      origin: normalizeOrigin(origin),
      ageMyr: 0,
      interior: makeInterior(normalizedParams),
      atmosphere: { ...atmosphere },
      atmospherePressureBar: normalizedParams.atmospherePressureBar,
      surface,
      chemistry: makeChemistry(normalizedParams, surface),
      lineages: [],
      foodWeb: [],
      interventions: [],
      timeline: [],
      snapshots: [],
      appliedInterventionCount: 0,
      failedOriginAttempts: 0,
      extinctionCount: 0,
      detritusBiomass: 0
    };
    this.addEvent({
      kind: "planet",
      title: "Planetary experiment initialized",
      summary: "Interior, atmosphere, surface, and chemistry reservoirs established from the seed.",
      detail: "The run begins after primary accretion, using normalized planetary and stellar parameters.",
      causes: [`Seed: ${normalizedParams.seed}`, `Stellar flux ${stellarFlux(normalizedParams).toFixed(2)} Earth units`],
      effects: { temperature: { before: "unset", after: surface.temperatureC, unit: "°C" }, pressure: { before: "unset", after: normalizedParams.atmospherePressureBar, unit: "bar" } },
      affectedLineageIds: [],
      confidence: "coarse",
      modelNote: "Early accretion and magma-ocean evolution are compressed into initial conditions."
    });
    this.captureSnapshot();
  }

  reset(seed: string, params?: Partial<PlanetParams>, origin?: Partial<OriginConfig>): void {
    const replacement = new HabitatSimulation(seed, params, origin);
    this.state = replacement.state;
    this.random = replacement.random;
    this.eventSequence = replacement.eventSequence;
    this.interventionSequence = 0;
    this.lastSnapshotAge = replacement.lastSnapshotAge;
  }

  setOrigin(origin: Partial<OriginConfig>): void {
    this.state.origin = normalizeOrigin({ ...this.state.origin, ...origin });
  }

  scheduleIntervention(type: InterventionType, scheduledAgeMyr = this.state.ageMyr): Intervention {
    this.interventionSequence += 1;
    const intervention = defaultIntervention(type, scheduledAgeMyr, this.interventionSequence);
    this.state.interventions.push(intervention);
    this.state.interventions.sort((a, b) => a.scheduledAgeMyr - b.scheduledAgeMyr || a.id.localeCompare(b.id));
    return intervention;
  }

  addIntervention(intervention: Omit<Intervention, "id" | "applied">): Intervention {
    this.interventionSequence += 1;
    const normalized: Intervention = {
      ...intervention,
      id: `int-${this.interventionSequence}-${Math.round(intervention.scheduledAgeMyr * 10)}`,
      scheduledAgeMyr: Math.max(this.state.ageMyr, Number(intervention.scheduledAgeMyr) || this.state.ageMyr),
      magnitude: clamp(Number(intervention.magnitude), 0.01, 1),
      cargo: { ...intervention.cargo },
      applied: false
    };
    this.state.interventions.push(normalized);
    this.state.interventions.sort((a, b) => a.scheduledAgeMyr - b.scheduledAgeMyr || a.id.localeCompare(b.id));
    return normalized;
  }

  interveneNow(type: InterventionType): Intervention {
    const event = this.scheduleIntervention(type, this.state.ageMyr);
    this.applyDueInterventions();
    return event;
  }

  step(dtMyr: number): void {
    const requested = clamp(Number(dtMyr), 0.01, 500);
    let remaining = requested;
    while (remaining > 0) {
      const dt = Math.min(5, remaining);
      this.applyDueInterventions();
      const beforeWater = this.state.surface.liquidWater;
      const beforeMagnetic = this.state.interior.magneticShield;
      updatePlanet(this.state, dt);
      const lifeEvents = evolveLife(this.state, dt, this.random);
      this.state.ageMyr += dt;
      for (const event of lifeEvents) this.addEvent(event);
      this.detectPlanetMilestones(beforeWater, beforeMagnetic);
      if (this.state.ageMyr - this.lastSnapshotAge >= 100) this.captureSnapshot();
      remaining -= dt;
    }
    this.applyDueInterventions();
  }

  runTo(targetAgeMyr: number, maxSteps = 10_000): void {
    const target = Math.max(this.state.ageMyr, targetAgeMyr);
    let steps = 0;
    while (this.state.ageMyr < target && steps < maxSteps) {
      this.step(Math.min(25, target - this.state.ageMyr));
      steps += 1;
    }
  }

  getSummary(): SimulationSummary {
    const state = structuredClone(this.state);
    const population = totalPopulation(state);
    const biomass = totalBiomass(state);
    const stage = dominantStage(state.lineages);
    const flux = stellarFlux(state.params);
    const diagnostic = biosphereDiagnostic(state);
    return {
      seed: state.params.seed,
      ageMyr: state.ageMyr,
      state,
      habitabilityScore: habitabilityScore(state),
      habitableZoneFlux: flux,
      habitableZoneStatus: habitableZoneStatus(flux, state.params.starTemperatureK),
      prebioticReadiness: prebioticReadiness(state),
      biosphereStatus: diagnostic.title,
      dominantStage: stage,
      totalPopulation: population,
      totalBiomass: biomass,
      biodiversity: state.lineages.length,
      oxygenPercent: state.atmosphere.o2 * 100,
      observables: planetObservables(state),
      limitingFactors: limitingFactors(state),
      diagnostic
    };
  }

  exportExperiment(): string {
    return JSON.stringify({ app: "habitat-sim", version: 1, exportedAt: new Date().toISOString(), state: this.state }, null, 2);
  }

  static fromExport(payload: unknown): HabitatSimulation {
    if (!isRecord(payload)) throw new Error("Experiment must be an object.");
    const record = payload;
    if (record.app !== "habitat-sim" || record.version !== 1 || !isRecord(record.state) || !isRecord(record.state.params)) throw new Error("Unsupported Habitat Sim experiment.");
    assertImportShape(record.state);
    const stateInput = record.state as unknown as Partial<SimulationState>;
    const importedParams = stateInput.params as PlanetParams;
    const simulation = new HabitatSimulation(String(importedParams.seed || "imported-seed"), importedParams, stateInput.origin);
    const safeAge = clamp(Number(stateInput.ageMyr), 0, 20_000);
    const base = simulation.state;
    const safeCounter = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
    simulation.state = {
      params: normalizeParams(stateInput.params),
      origin: normalizeOrigin(stateInput.origin),
      ageMyr: safeAge,
      interior: structuredClone(stateInput.interior ?? base.interior),
      atmosphere: normalizeAtmosphere(stateInput.atmosphere),
      atmospherePressureBar: Number.isFinite(Number(stateInput.atmospherePressureBar))
        ? clamp(Number(stateInput.atmospherePressureBar), 0.01, 20)
        : base.params.atmospherePressureBar,
      surface: structuredClone(stateInput.surface ?? base.surface),
      chemistry: structuredClone(stateInput.chemistry ?? base.chemistry),
      lineages: structuredClone(stateInput.lineages?.slice(0, 40) ?? []),
      foodWeb: structuredClone(stateInput.foodWeb?.slice(0, 100) ?? []),
      interventions: structuredClone(stateInput.interventions?.slice(0, 200) ?? []),
      timeline: structuredClone(stateInput.timeline?.slice(0, 500) ?? []),
      snapshots: structuredClone(stateInput.snapshots?.slice(0, 120) ?? []),
      appliedInterventionCount: safeCounter(stateInput.appliedInterventionCount),
      failedOriginAttempts: safeCounter(stateInput.failedOriginAttempts),
      extinctionCount: safeCounter(stateInput.extinctionCount),
      detritusBiomass: Number.isFinite(Number(stateInput.detritusBiomass)) ? Math.max(0, Number(stateInput.detritusBiomass)) : 0
    };
    simulation.random = makeRandom(`${simulation.state.params.seed}:resume:${safeAge}:${simulation.state.timeline.length}`);
    simulation.eventSequence = simulation.state.timeline.length;
    simulation.interventionSequence = simulation.state.interventions.length;
    simulation.lastSnapshotAge = simulation.state.snapshots.at(-1)?.ageMyr ?? safeAge;
    return simulation;
  }

  private applyDueInterventions(): void {
    const due = this.state.interventions.filter((intervention) => !intervention.applied && intervention.scheduledAgeMyr <= this.state.ageMyr + 0.0001);
    for (const intervention of due) this.addEvent(applyIntervention(this.state, intervention, this.random));
  }

  private detectPlanetMilestones(beforeWater: number, beforeMagnetic: number): void {
    if (beforeWater < 0.25 && this.state.surface.liquidWater >= 0.25 && !this.hasEvent("Persistent liquid-water reservoirs")) {
      this.addEvent({ kind: "planet", title: "Persistent liquid-water reservoirs", summary: "Thermal and pressure conditions now maintain substantial surface liquid.", detail: "Liquid water expands solvent volume and transport but does not by itself imply habitability or life.", causes: [`Temperature ${this.state.surface.temperatureC.toFixed(1)}°C`, `Pressure ${this.state.atmospherePressureBar.toFixed(2)} bar`], effects: { liquidWater: { before: beforeWater, after: this.state.surface.liquidWater } }, affectedLineageIds: [], confidence: "coarse", modelNote: "Global reservoirs compress regional and seasonal variation." });
    }
    if (beforeMagnetic >= 0.22 && this.state.interior.magneticShield < 0.22 && !this.hasEvent("Dynamo weakened")) {
      this.addEvent({ kind: "planet", title: "Dynamo weakened", summary: "Falling core activity reduced magnetic shielding.", detail: "Atmospheric escape and surface radiation sensitivity increase as the modeled dynamo fades.", causes: [`Interior heat ${this.state.interior.heat.toFixed(2)}`, `Rotation ${this.state.params.rotationHours.toFixed(0)} hours`], effects: { magneticShield: { before: beforeMagnetic, after: this.state.interior.magneticShield } }, affectedLineageIds: this.state.lineages.map((lineage) => lineage.id), confidence: "coarse", modelNote: "Real dynamo behavior depends on fluid-core convection and composition beyond this proxy." });
    }
    if (this.state.chemistry.polymers >= 0.05 && !this.hasEvent("Functional polymers accumulated")) {
      this.addEvent({ kind: "chemistry", title: "Functional polymers accumulated", summary: "Repeated concentration and catalytic opportunities built a persistent polymer reservoir.", detail: "Polymers raise the chance of inheritance and catalysis without guaranteeing self-replication.", causes: [`Wet-dry cycling ${this.state.surface.wetDryCycling.toFixed(2)}`, `Hydrothermal activity ${this.state.surface.hydrothermalActivity.toFixed(2)}`], effects: { polymers: { before: 0, after: this.state.chemistry.polymers } }, affectedLineageIds: [], confidence: "speculative", modelNote: "Prebiotic polymer identity and formation pathways remain unresolved." });
    }
    if (this.state.foodWeb.length && !this.hasEvent("First trophic interaction")) {
      this.addEvent({ kind: "ecology", title: "First trophic interaction", summary: "Energy began flowing directly between distinct lineages.", detail: "A consumer-resource link emerged from size, mobility, digestion, defense, and available biomass.", causes: [`${this.state.lineages.length} coexisting lineages`], effects: { foodWebLinks: { before: 0, after: this.state.foodWeb.length } }, affectedLineageIds: [this.state.foodWeb[0].sourceId, this.state.foodWeb[0].targetId], confidence: "coarse", modelNote: "Spatial encounter rates are compressed into aggregate interactions." });
    }
  }

  private addEvent(draft: EventDraft): void {
    this.eventSequence += 1;
    const event: TimelineEvent = { ...draft, id: `evt-${this.eventSequence}-${Math.round(this.state.ageMyr * 10)}`, ageMyr: this.state.ageMyr };
    this.state.timeline.unshift(event);
    if (this.state.timeline.length > 500) {
      const milestones = this.state.timeline.filter((item) => item.kind !== "planet" || item.title.includes("initialized"));
      this.state.timeline = [...milestones.slice(0, 420), ...this.state.timeline.filter((item) => item.kind === "planet").slice(0, 80)]
        .sort((a, b) => b.ageMyr - a.ageMyr)
        .slice(0, 500);
    }
  }

  private hasEvent(title: string): boolean {
    return this.state.timeline.some((event) => event.title === title);
  }

  private captureSnapshot(): void {
    const snapshot: PlanetSnapshot = {
      ageMyr: this.state.ageMyr,
      temperatureC: this.state.surface.temperatureC,
      pressureBar: this.state.atmospherePressureBar,
      oxygen: this.state.atmosphere.o2,
      liquidWater: this.state.surface.liquidWater,
      prebioticReadiness: prebioticReadiness(this.state),
      lineages: this.state.lineages.length,
      population: totalPopulation(this.state),
      dominantStage: dominantStage(this.state.lineages)
    };
    this.state.snapshots.push(snapshot);
    if (this.state.snapshots.length > 120) {
      const milestones = new Set(this.state.timeline.filter((event) => event.kind === "origin" || event.kind === "intervention" || event.kind === "evolution").map((event) => Math.round(event.ageMyr / 100) * 100));
      this.state.snapshots = this.state.snapshots.filter((item, index) => index % 2 === 0 || milestones.has(Math.round(item.ageMyr / 100) * 100)).slice(-120);
    }
    this.lastSnapshotAge = this.state.ageMyr;
  }
}

export function deterministicFingerprint(summary: SimulationSummary): string {
  const stable = JSON.stringify({
    seed: summary.seed,
    age: Number(summary.ageMyr.toFixed(4)),
    temperature: Number(summary.state.surface.temperatureC.toFixed(4)),
    atmosphere: summary.state.atmosphere,
    chemistry: summary.state.chemistry,
    lineages: summary.state.lineages.map((lineage) => ({ id: lineage.id, stage: lineage.stage, population: Number(lineage.population.toFixed(2)), structures: lineage.structures })),
    events: summary.state.timeline.map((event) => [event.title, Number(event.ageMyr.toFixed(2))])
  });
  return hashString(stable).toString(16).padStart(8, "0");
}
