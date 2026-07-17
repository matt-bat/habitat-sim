import { DEFAULT_ELEMENTS, DEFAULT_PARAMS, PARAM_BOUNDS } from "./constants";
import { clamp } from "./random";
import type { Atmosphere, ChemistryState, GasId, InteriorState, LimitingFactor, PlanetObservables, PlanetParams, SimulationState, SurfaceState } from "./types";

const GAS_KEYS: GasId[] = ["n2", "co2", "h2o", "ch4", "o2", "h2", "nh3", "so2"];

export function normalizeAtmosphere(input?: Partial<Atmosphere>): Atmosphere {
  const values = Object.fromEntries(GAS_KEYS.map((gas) => {
    const candidate = Number(input?.[gas] ?? DEFAULT_PARAMS.atmosphere[gas]);
    const value = Number.isFinite(candidate) ? candidate : DEFAULT_PARAMS.atmosphere[gas];
    return [gas, clamp(value, 0, 1)];
  })) as Atmosphere;
  const total = GAS_KEYS.reduce((sum, gas) => sum + values[gas], 0) || 1;
  for (const gas of GAS_KEYS) values[gas] /= total;
  return values;
}

export function normalizeParams(input?: Partial<PlanetParams>): PlanetParams {
  const normalized: PlanetParams = {
    ...DEFAULT_PARAMS,
    ...input,
    seed: String(input?.seed ?? DEFAULT_PARAMS.seed).slice(0, 120),
    atmosphere: normalizeAtmosphere(input?.atmosphere)
  };
  for (const [key, bounds] of Object.entries(PARAM_BOUNDS) as Array<[keyof PlanetParams, [number, number]]>) {
    const candidate = Number(normalized[key]);
    const fallback = Number(DEFAULT_PARAMS[key]);
    const raw = Number.isFinite(candidate) ? candidate : fallback;
    (normalized as unknown as Record<string, number>)[key] = clamp(raw, bounds[0], bounds[1]);
  }
  const rockTotal = normalized.coreFraction + normalized.mantleFraction;
  if (rockTotal > 0.98) {
    normalized.coreFraction = normalized.coreFraction / rockTotal * 0.98;
    normalized.mantleFraction = normalized.mantleFraction / rockTotal * 0.98;
  }
  return normalized;
}

export function stellarFlux(params: PlanetParams): number {
  const eccentricityAverage = 1 / Math.sqrt(Math.max(0.01, 1 - params.orbitalEccentricity ** 2));
  return params.starLuminositySolar * eccentricityAverage / Math.max(0.0009, params.orbitalDistanceAu ** 2);
}

/** Kopparapu et al. (2013/2014) conservative runaway/maximum-greenhouse flux fits. */
export function habitableZoneFluxLimits(starTemperatureK: number): { inner: number; outer: number } {
  const t = clamp(starTemperatureK, 2600, 7200) - 5780;
  const fit = (s0: number, a: number, b: number, c: number, d: number) => s0 + a * t + b * t ** 2 + c * t ** 3 + d * t ** 4;
  return {
    inner: fit(1.107, 1.332e-4, 1.58e-8, -8.308e-12, -1.931e-15),
    outer: fit(0.356, 6.171e-5, 1.698e-9, -3.198e-12, -5.575e-16)
  };
}

export function habitableZoneStatus(flux: number, starTemperatureK = 5780): "inner-hot" | "temperate-flux" | "outer-cold" {
  const limits = habitableZoneFluxLimits(starTemperatureK);
  if (flux > limits.inner) return "inner-hot";
  if (flux < limits.outer) return "outer-cold";
  return "temperate-flux";
}

export function greenhouseWarming(atmosphere: Atmosphere, pressureBar: number): number {
  const pressureFactor = Math.log1p(Math.max(0.01, pressureBar)) / Math.log(2);
  const absorbers = atmosphere.h2o * 1.1 + atmosphere.co2 * 0.95 + atmosphere.ch4 * 1.35 + atmosphere.h2 * 0.28 + atmosphere.nh3 * 0.75;
  return clamp(12 + pressureFactor * (15 + absorbers * 52), 0, 140);
}

export function equilibriumTemperatureNoGreenhouse(params: PlanetParams): number {
  const flux = stellarFlux(params);
  return 278.5 * Math.pow(Math.max(0.01, flux), 0.25) * Math.pow((1 - params.albedo) / 0.7, 0.25) - 273.15;
}

export function equilibriumTemperature(params: PlanetParams, atmosphere: Atmosphere, pressureBar: number): number {
  return equilibriumTemperatureNoGreenhouse(params) + greenhouseWarming(atmosphere, pressureBar);
}

export function atmospherePartialPressures(atmosphere: Atmosphere, pressureBar: number): Atmosphere {
  return Object.fromEntries(GAS_KEYS.map((gas) => [gas, Math.max(0, atmosphere[gas] * pressureBar)])) as Atmosphere;
}

/** Applies gas source/sink fluxes in bar, preserving the remaining gases' absolute inventories. */
export function applyAtmosphereFlux(state: Pick<SimulationState, "atmosphere" | "atmospherePressureBar">, deltasBar: Partial<Atmosphere>): void {
  const partials = atmospherePartialPressures(state.atmosphere, state.atmospherePressureBar);
  for (const gas of GAS_KEYS) partials[gas] = Math.max(1e-9, partials[gas] + (deltasBar[gas] || 0));
  const total = GAS_KEYS.reduce((sum, gas) => sum + partials[gas], 0);
  state.atmospherePressureBar = clamp(total, 0.01, 20);
  for (const gas of GAS_KEYS) state.atmosphere[gas] = partials[gas] / total;
}

export function makeInterior(params: PlanetParams): InteriorState {
  const coreActivity = clamp(params.initialHeat * 0.56 + params.radionuclides * 0.24 + params.coreFraction * 0.42);
  return {
    heat: params.initialHeat,
    coreActivity,
    magneticShield: clamp(coreActivity * params.coreFraction * 2.3 * Math.min(1.2, params.planetMassEarth / params.planetRadiusEarth)),
    volcanism: clamp(params.initialHeat * params.mantleFraction * 1.1),
    tectonics: clamp(params.tectonicMobility * params.initialHeat),
    outgassing: clamp(params.initialHeat * params.mantleFraction * 0.75)
  };
}

export function makeSurface(params: PlanetParams, atmosphere: Atmosphere): SurfaceState {
  const temperatureC = equilibriumTemperature(params, atmosphere, params.atmospherePressureBar);
  const liquidThermal = clamp(1 - Math.abs(temperatureC - 18) / 72);
  const ice = clamp((5 - temperatureC) / 70) * params.waterInventory;
  const liquidWater = clamp(params.waterInventory * liquidThermal - ice * 0.25);
  return {
    temperatureC,
    liquidWater,
    ice: clamp(ice),
    oceanCoverage: clamp(liquidWater * (1 - params.landFraction * 0.35)),
    landFraction: params.landFraction,
    radiation: clamp(params.starActivity / Math.max(0.25, params.atmospherePressureBar * params.planetMassEarth / params.planetRadiusEarth ** 2)),
    nutrients: clamp(0.26 + params.tectonicMobility * 0.38 + params.impactRate * 0.16),
    hydrothermalActivity: clamp(params.initialHeat * params.waterInventory * params.tectonicMobility),
    wetDryCycling: clamp(params.landFraction * params.waterInventory * (0.5 + params.axialTiltDeg / 90)),
    ph: clamp(7.6 - atmosphere.co2 * params.atmospherePressureBar * 2.8 + params.landFraction * 0.45, 2, 12)
  };
}

export function makeChemistry(params: PlanetParams, surface: SurfaceState): ChemistryState {
  const elements = { ...DEFAULT_ELEMENTS };
  elements.phosphorus = clamp(elements.phosphorus + params.landFraction * 0.14);
  elements.sulfur = clamp(elements.sulfur + params.initialHeat * 0.14);
  return {
    elements,
    simpleOrganics: 0.08 + params.atmosphere.ch4 * 0.4,
    aminoAcids: 0.025,
    lipids: 0.015,
    nucleotides: 0.008,
    polymers: 0,
    protocells: 0,
    redoxGradient: clamp(surface.hydrothermalActivity * 0.7 + params.atmosphere.co2 * 0.2 + params.atmosphere.h2 * 0.4)
  };
}

export function habitabilityScore(state: SimulationState): number {
  const thermal = clamp(1 - Math.abs(state.surface.temperatureC - 20) / 85);
  const pressure = clamp(1 - Math.abs(Math.log10(Math.max(0.01, state.atmospherePressureBar))) / 1.5);
  const water = clamp(state.surface.liquidWater * 1.35);
  const radiation = clamp(1 - state.surface.radiation * 0.88);
  const stability = clamp(state.interior.tectonics * 0.22 + (1 - state.params.orbitalEccentricity) * 0.28 + 0.5);
  return clamp(thermal * 0.29 + pressure * 0.16 + water * 0.25 + radiation * 0.17 + stability * 0.13);
}

export function planetObservables(state: SimulationState): PlanetObservables {
  const { params } = state;
  const gravityEarth = params.planetMassEarth / params.planetRadiusEarth ** 2;
  const escapeVelocityKmS = 11.186 * Math.sqrt(params.planetMassEarth / params.planetRadiusEarth);
  const orbitalPeriodDays = 365.256 * Math.sqrt(params.orbitalDistanceAu ** 3 / Math.max(0.1, params.starMassSolar));
  const equilibriumTemperatureC = equilibriumTemperatureNoGreenhouse(params);
  const greenhouseDeltaC = state.surface.temperatureC - equilibriumTemperatureC;
  const hz = habitableZoneFluxLimits(params.starTemperatureK);
  const column = state.atmospherePressureBar * gravityEarth;
  const atmosphericRetentionIndex = clamp((escapeVelocityKmS / 11.186) * 0.58 + Math.log1p(column) * 0.24 - params.starActivity * 0.32);
  const climateStabilityIndex = clamp((1 - params.orbitalEccentricity) * 0.34 + (1 - params.axialTiltDeg / 90) * 0.16 + state.interior.tectonics * 0.22 + state.surface.liquidWater * 0.28);
  const redoxDisequilibriumIndex = clamp((state.atmosphere.o2 * state.atmosphere.ch4 * 110) + state.chemistry.redoxGradient * 0.36);
  const closeOrbit = params.orbitalDistanceAu < 0.18 * Math.cbrt(params.starMassSolar);
  const tidalLockingRisk = closeOrbit || params.rotationHours > orbitalPeriodDays * 12 ? "high" : params.rotationHours > 96 || params.orbitalDistanceAu < 0.45 ? "moderate" : "low";
  const oxygenicProduction = state.lineages.reduce((sum, lineage) => {
    const oxygenic = (lineage.metabolism === "phototroph" || lineage.metabolism === "mixotroph")
      && (lineage.structures.includes("chloroplast") || lineage.traits.photosynthesis > 0.72);
    return sum + (oxygenic ? lineage.biomass * lineage.traits.photosynthesis : 0);
  }, 0);
  const oxygenSinks = state.lineages.reduce((sum, lineage) => sum + lineage.biomass * lineage.traits.oxygenUse, 0) + state.interior.volcanism * 0.12 + state.atmosphere.ch4 * state.atmospherePressureBar;
  return { gravityEarth, escapeVelocityKmS, orbitalPeriodDays, equilibriumTemperatureC, greenhouseDeltaC, habitableZoneInnerFlux: hz.inner, habitableZoneOuterFlux: hz.outer, atmosphericRetentionIndex, climateStabilityIndex, redoxDisequilibriumIndex, tidalLockingRisk, oxygenicProduction, oxygenSinks };
}

export function limitingFactors(state: SimulationState): LimitingFactor[] {
  const factors: LimitingFactor[] = [
    { id: "thermal", label: "Thermal regime", score: clamp(1 - Math.abs(state.surface.temperatureC - 20) / 85), detail: `${state.surface.temperatureC.toFixed(1)}°C global proxy`, counterfactual: "Adjust orbit, albedo, pressure, or greenhouse inventory.", confidence: "coarse" },
    { id: "water", label: "Liquid solvent", score: clamp(state.surface.liquidWater * 1.3), detail: `${(state.surface.liquidWater * 100).toFixed(0)} model index`, counterfactual: "Deliver water or shift temperature into the liquid range.", confidence: "coarse" },
    { id: "radiation", label: "Radiation load", score: clamp(1 - state.surface.radiation), detail: `${(state.surface.radiation * 100).toFixed(0)} model index`, counterfactual: "Reduce stellar activity or increase atmospheric column.", confidence: "coarse" },
    { id: "pressure", label: "Atmospheric column", score: clamp(1 - Math.abs(Math.log10(Math.max(0.01, state.atmospherePressureBar))) / 1.5), detail: `${state.atmospherePressureBar.toFixed(2)} bar`, counterfactual: "Change initial inventory, outgassing, or escape forcing.", confidence: "grounded" },
    { id: "building-blocks", label: "Building blocks", score: clamp((state.chemistry.aminoAcids + state.chemistry.lipids + state.chemistry.nucleotides) / 1.2), detail: "Amino-acid, lipid, and nucleotide analogue reservoirs", counterfactual: "Increase catalytic chemistry or exogenous organic delivery.", confidence: "speculative" },
    { id: "gradients", label: "Usable gradients", score: state.chemistry.redoxGradient, detail: "Redox and hydrothermal opportunity index", counterfactual: "Increase mineral redox contrast or hydrothermal circulation.", confidence: "coarse" },
    { id: "nutrients", label: "Nutrient access", score: state.surface.nutrients, detail: "Accessible nutrient model index", counterfactual: "Increase weathering, recycling, or nutrient deposition.", confidence: "coarse" }
  ];
  return factors.sort((a, b) => a.score - b.score);
}

export function prebioticReadiness(state: SimulationState): number {
  const chemistry = state.chemistry;
  const buildingBlocks = clamp((chemistry.aminoAcids + chemistry.lipids + chemistry.nucleotides * 1.4 + chemistry.polymers * 1.8) / 2.1);
  const gradients = clamp((chemistry.redoxGradient + state.origin.energy + state.origin.catalysts) / 3);
  const cycling = clamp((state.surface.wetDryCycling * state.origin.wetDryCycling + state.surface.hydrothermalActivity * state.origin.ventFlux) * 0.9);
  return clamp(habitabilityScore(state) * 0.32 + buildingBlocks * 0.34 + gradients * 0.2 + cycling * 0.14);
}

export function updatePlanet(state: SimulationState, dtMyr: number): void {
  const { params, interior, atmosphere, surface, chemistry } = state;
  const dt = Math.min(dtMyr, 25);
  const heatLoss = (0.000035 + (1 - params.radionuclides) * 0.00002) * dt;
  interior.heat = clamp(interior.heat - heatLoss + params.radionuclides * 0.000007 * dt);
  interior.coreActivity = clamp(interior.heat * 0.52 + params.coreFraction * 0.38 + params.radionuclides * 0.18);
  const rotationSupport = clamp(30 / Math.max(8, params.rotationHours), 0.12, 1.1);
  interior.magneticShield = clamp(interior.coreActivity * params.coreFraction * 2.15 * rotationSupport * Math.min(1.3, params.planetMassEarth / params.planetRadiusEarth));
  interior.volcanism = clamp(interior.heat * params.mantleFraction * (0.5 + params.tectonicMobility * 0.65));
  interior.tectonics = clamp(params.tectonicMobility * interior.heat * (0.6 + params.waterInventory * 0.35));
  interior.outgassing = clamp(interior.volcanism * (0.65 + params.radionuclides * 0.25));

  const gravity = params.planetMassEarth / params.planetRadiusEarth ** 2;
  const erosion = params.starActivity * 0.000012 * dt / Math.max(0.18, gravity * state.atmospherePressureBar);
  const partials = atmospherePartialPressures(atmosphere, state.atmospherePressureBar);
  applyAtmosphereFlux(state, {
    n2: -partials.n2 * erosion * 0.18,
    co2: interior.outgassing * 0.000018 * dt - interior.tectonics * surface.liquidWater * 0.000012 * dt - partials.co2 * erosion * 0.08,
    h2o: interior.outgassing * 0.000008 * dt - Math.max(0, surface.temperatureC - 70) * 0.000001 * dt - partials.h2o * erosion * 0.2,
    so2: interior.volcanism * 0.000004 * dt - Math.min(partials.so2, 0.000006 * dt),
    h2: -partials.h2 * erosion * 4,
    nh3: -partials.nh3 * params.starActivity * 0.00002 * dt,
    ch4: -partials.ch4 * erosion * 0.35,
    o2: -partials.o2 * erosion * 0.12
  });

  const targetTemperature = equilibriumTemperature(params, atmosphere, state.atmospherePressureBar);
  surface.temperatureC += (targetTemperature - surface.temperatureC) * clamp(dt * 0.015, 0.01, 0.3);
  const thermalLiquid = clamp(1 - Math.abs(surface.temperatureC - 18) / 76);
  const escapeLoss = Math.max(0, surface.temperatureC - 75) * erosion * 0.002 * dt;
  params.waterInventory = clamp(params.waterInventory - escapeLoss, 0, 1.5);
  surface.ice = clamp(params.waterInventory * clamp((5 - surface.temperatureC) / 72));
  surface.liquidWater = clamp(params.waterInventory * thermalLiquid - surface.ice * 0.18);
  surface.oceanCoverage = clamp(surface.liquidWater * (1 - surface.landFraction * 0.3));
  surface.radiation = clamp(params.starActivity / Math.max(0.2, state.atmospherePressureBar * gravity) * (0.92 - interior.magneticShield * 0.08));
  surface.hydrothermalActivity = clamp(interior.volcanism * surface.liquidWater * (0.4 + interior.tectonics * 0.6));
  surface.wetDryCycling = clamp(surface.landFraction * surface.liquidWater * (0.55 + params.axialTiltDeg / 75));
  surface.nutrients = clamp(surface.nutrients + (interior.tectonics * surface.landFraction + surface.hydrothermalActivity) * 0.00004 * dt - state.lineages.length * 0.000006 * dt);
  surface.ph = clamp(7.6 - atmosphere.co2 * state.atmospherePressureBar * 2.8 + interior.tectonics * 0.45, 2, 12);

  const energyChemistry = state.origin.energy * (0.35 + params.starActivity * 0.28 + interior.volcanism * 0.37);
  const catalytic = state.origin.catalysts * (0.35 + surface.nutrients * 0.25 + surface.hydrothermalActivity * 0.4);
  const organicGain = (energyChemistry + state.origin.exogenousDose * state.origin.recurrence * 0.2) * 0.00013 * dt;
  chemistry.simpleOrganics = clamp(chemistry.simpleOrganics + organicGain - surface.radiation * 0.000035 * dt, 0, 3);
  chemistry.aminoAcids = clamp(chemistry.aminoAcids + chemistry.simpleOrganics * catalytic * 0.000065 * dt, 0, 2);
  chemistry.lipids = clamp(chemistry.lipids + chemistry.simpleOrganics * (0.3 + surface.wetDryCycling) * 0.000047 * dt, 0, 2);
  chemistry.nucleotides = clamp(chemistry.nucleotides + chemistry.simpleOrganics * catalytic * surface.liquidWater * 0.00003 * dt, 0, 2);
  const polymerization = chemistry.aminoAcids * chemistry.nucleotides * (surface.wetDryCycling * state.origin.wetDryCycling + surface.hydrothermalActivity * state.origin.ventFlux) * 0.000018 * dt;
  chemistry.polymers = clamp(chemistry.polymers + polymerization - surface.radiation * 0.000008 * dt, 0, 2);
  chemistry.redoxGradient = clamp(surface.hydrothermalActivity * 0.52 + atmosphere.h2 * 0.24 + atmosphere.co2 * 0.18 + atmosphere.o2 * 0.38);
}
