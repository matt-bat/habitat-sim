import { DEFAULT_ELEMENTS, DEFAULT_PARAMS, PARAM_BOUNDS } from "./constants";
import { clamp } from "./random";
import type { Atmosphere, ChemistryState, ElementalBasis, ElementId, GasId, InteriorState, LimitingFactor, OriginDiagnostics, OriginGate, PlanetObservables, PlanetParams, SimulationState, SurfaceState } from "./types";

const GAS_KEYS: GasId[] = ["n2", "co2", "h2o", "ch4", "o2", "h2", "nh3", "so2"];
const ELEMENT_KEYS: ElementId[] = ["carbon", "hydrogen", "nitrogen", "oxygen", "phosphorus", "sulfur", "iron"];

export function normalizeAtmosphere(input?: Partial<Atmosphere>): Atmosphere {
  const values = Object.fromEntries(GAS_KEYS.map((gas) => {
    const candidate = Number(input?.[gas] ?? DEFAULT_PARAMS.atmosphere[gas]);
    const value = Number.isFinite(candidate) ? candidate : DEFAULT_PARAMS.atmosphere[gas];
    return [gas, clamp(value, 0, 1)];
  })) as Atmosphere;
  const total = GAS_KEYS.reduce((sum, gas) => sum + values[gas], 0) || 1;
  if (Math.abs(total - 1) <= 1e-12) return values;
  for (const gas of GAS_KEYS) values[gas] /= total;
  return values;
}

export function normalizeElementBasis(input?: Partial<ElementalBasis>): ElementalBasis {
  return Object.fromEntries(ELEMENT_KEYS.map((element) => {
    const candidate = Number(input?.[element] ?? DEFAULT_ELEMENTS[element]);
    return [element, clamp(Number.isFinite(candidate) ? candidate : DEFAULT_ELEMENTS[element])];
  })) as ElementalBasis;
}

export function normalizeParams(input?: Partial<PlanetParams>): PlanetParams {
  const normalized: PlanetParams = {
    ...DEFAULT_PARAMS,
    ...input,
    seed: String(input?.seed ?? DEFAULT_PARAMS.seed).slice(0, 120),
    atmosphere: normalizeAtmosphere(input?.atmosphere),
    elementBasis: normalizeElementBasis(input?.elementBasis)
  };
  for (const [key, bounds] of Object.entries(PARAM_BOUNDS) as Array<[keyof PlanetParams, [number, number]]>) {
    const candidate = Number(normalized[key]);
    const fallback = Number(DEFAULT_PARAMS[key]);
    const raw = Number.isFinite(candidate) ? candidate : fallback;
    (normalized as unknown as Record<string, number>)[key] = clamp(raw, bounds[0], bounds[1]);
  }
  normalized.starCount = Math.round(normalized.starCount);
  if (normalized.starCount === 1) normalized.starTopology = "single";
  else if (normalized.starCount === 2 && normalized.starTopology === "single") normalized.starTopology = "circumbinary";
  else if (normalized.starCount === 3) normalized.starTopology = "hierarchical-triple";
  if (!["single", "circumbinary", "hierarchical-triple"].includes(normalized.starTopology)) normalized.starTopology = normalized.starCount === 1 ? "single" : normalized.starCount === 2 ? "circumbinary" : "hierarchical-triple";
  if (normalized.biochemistryMode !== "unsupported-alternative") normalized.biochemistryMode = "aqueous-carbon";
  const rockTotal = normalized.coreFraction + normalized.mantleFraction;
  if (rockTotal > 0.9800000001) {
    normalized.coreFraction = normalized.coreFraction / rockTotal * 0.98;
    normalized.mantleFraction = normalized.mantleFraction / rockTotal * 0.98;
  }
  return normalized;
}

export function stellarFluxComponents(params: PlanetParams): { primary: number; companion: number; total: number; companionFraction: number } {
  const eccentricityAverage = 1 / Math.sqrt(Math.max(0.01, 1 - params.orbitalEccentricity ** 2));
  const primary = params.starLuminositySolar * eccentricityAverage / Math.max(0.0009, params.orbitalDistanceAu ** 2);
  const companion = params.starCount > 1
    ? (params.starCount - 1) * params.companionLuminositySolar / Math.max(0.0025, params.companionDistanceAu ** 2)
    : 0;
  const total = primary + companion;
  return { primary, companion, total, companionFraction: companion / Math.max(0.0001, total) };
}

export function stellarFlux(params: PlanetParams): number {
  return stellarFluxComponents(params).total;
}

export function stellarClass(temperatureK: number): "M" | "K" | "G" | "F" | "A" {
  if (temperatureK < 3900) return "M";
  if (temperatureK < 5200) return "K";
  if (temperatureK < 6000) return "G";
  if (temperatureK < 7500) return "F";
  return "A";
}

export function effectiveStellarActivity(params: PlanetParams, elapsedMyr = 0): number {
  const ageGyr = Math.max(0.05, params.starAgeGyr + elapsedMyr / 1000);
  const ageAmplification = Math.pow(Math.max(0.08, ageGyr / 4.6), -0.55);
  const coolStarPersistence = params.starTemperatureK < 3900 ? 1.22 : params.starTemperatureK > 6500 ? 1.12 : 1;
  return clamp(params.starActivity * ageAmplification * coolStarPersistence, 0, 2.5);
}

export function orbitalExtremes(params: PlanetParams): { periapsisAu: number; apoapsisAu: number; periapsisFlux: number; apoapsisFlux: number } {
  const periapsisAu = Math.max(0.001, params.orbitalDistanceAu * (1 - params.orbitalEccentricity));
  const apoapsisAu = params.orbitalDistanceAu * (1 + params.orbitalEccentricity);
  const companion = stellarFluxComponents(params).companion;
  return {
    periapsisAu,
    apoapsisAu,
    periapsisFlux: params.starLuminositySolar / periapsisAu ** 2 + companion * (1 + params.companionVariability),
    apoapsisFlux: params.starLuminositySolar / Math.max(0.000001, apoapsisAu ** 2) + companion * (1 - params.companionVariability)
  };
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

export function greenhouseContributions(atmosphere: Atmosphere, pressureBar: number): Partial<Record<GasId | "pressure", number>> {
  const partials = atmospherePartialPressures(atmosphere, pressureBar);
  const pressureBroadening = 5 * Math.log1p(Math.max(0.01, pressureBar));
  return {
    h2o: 18 * Math.log1p(partials.h2o * 10),
    co2: 12 * Math.log1p(partials.co2 * 20),
    ch4: 8 * Math.log1p(partials.ch4 * 50),
    h2: 4 * Math.log1p(partials.h2 * pressureBar * 10),
    nh3: 6 * Math.log1p(partials.nh3 * 40),
    pressure: pressureBroadening
  };
}

export function greenhouseWarming(atmosphere: Atmosphere, pressureBar: number): number {
  return clamp(Object.values(greenhouseContributions(atmosphere, pressureBar)).reduce((sum, value) => sum + (value || 0), 0), 0, 140);
}

export function equilibriumTemperatureNoGreenhouse(params: PlanetParams, albedo = params.albedo): number {
  const flux = stellarFlux(params);
  return 278.5 * Math.pow(Math.max(0.01, flux), 0.25) * Math.pow((1 - albedo) / 0.7, 0.25) - 273.15;
}

export function equilibriumTemperature(params: PlanetParams, atmosphere: Atmosphere, pressureBar: number, albedo = params.albedo): number {
  return equilibriumTemperatureNoGreenhouse(params, albedo) + greenhouseWarming(atmosphere, pressureBar);
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

function cloudCoverIndex(atmosphere: Atmosphere, pressureBar: number, liquidWater: number, rotationHours: number): number {
  const waterColumn = atmosphere.h2o * pressureBar;
  const slowRotationClouds = clamp((rotationHours - 24) / 240) * 0.14;
  return clamp(waterColumn * 1.7 + liquidWater * 0.34 + slowRotationClouds);
}

export function effectivePlanetaryAlbedo(params: PlanetParams, surface?: Pick<SurfaceState, "ice" | "oceanCoverage" | "liquidWater">, atmosphere = params.atmosphere, pressureBar = params.atmospherePressureBar): number {
  const ice = surface?.ice ?? 0;
  const ocean = surface?.oceanCoverage ?? clamp(params.waterInventory * (1 - params.landFraction));
  const liquid = surface?.liquidWater ?? clamp(params.waterInventory);
  const clouds = cloudCoverIndex(atmosphere, pressureBar, liquid, params.rotationHours);
  return clamp(params.albedo + ice * 0.32 - ocean * 0.08 + clouds * 0.1, 0.04, 0.82);
}

function climateRegime(temperatureC: number, liquidWater: number, ice: number): PlanetObservables["climateRegime"] {
  if (ice > 0.72 || temperatureC < -18) return "snowball";
  if (temperatureC < 4 || liquidWater < 0.12) return "cold-arid";
  if (temperatureC < 35) return "temperate";
  if (temperatureC < 58) return "warm-humid";
  if (temperatureC < 82) return "moist-greenhouse";
  return "hothouse";
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
  const provisionalTemperature = equilibriumTemperature(params, atmosphere, params.atmospherePressureBar);
  const provisionalIce = clamp((5 - provisionalTemperature) / 70) * params.waterInventory;
  const provisionalLiquid = clamp(params.waterInventory * clamp(1 - Math.abs(provisionalTemperature - 18) / 72) - provisionalIce * 0.25);
  const provisionalSurface = { ice: provisionalIce, liquidWater: provisionalLiquid, oceanCoverage: clamp(provisionalLiquid * (1 - params.landFraction * 0.35)) };
  const temperatureC = equilibriumTemperature(params, atmosphere, params.atmospherePressureBar, effectivePlanetaryAlbedo(params, provisionalSurface, atmosphere, params.atmospherePressureBar));
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
  const elements = { ...params.elementBasis };
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
  const stellarVariation = stellarFluxComponents(state.params).companionFraction * state.params.companionVariability;
  const stability = clamp(state.interior.tectonics * 0.22 + (1 - state.params.orbitalEccentricity) * 0.28 + 0.5 - stellarVariation * .2);
  return clamp(thermal * 0.29 + pressure * 0.16 + water * 0.25 + radiation * 0.17 + stability * 0.13);
}

export function planetObservables(state: SimulationState): PlanetObservables {
  const { params } = state;
  const gravityEarth = params.planetMassEarth / params.planetRadiusEarth ** 2;
  const escapeVelocityKmS = 11.186 * Math.sqrt(params.planetMassEarth / params.planetRadiusEarth);
  const bulkDensityGcm3 = 5.514 * params.planetMassEarth / params.planetRadiusEarth ** 3;
  const orbitalPeriodDays = 365.256 * Math.sqrt(params.orbitalDistanceAu ** 3 / Math.max(0.1, params.starMassSolar));
  const extremes = orbitalExtremes(params);
  const fluxComponents = stellarFluxComponents(params);
  const orbitalForcingAmplitude = clamp((extremes.periapsisFlux - extremes.apoapsisFlux) / Math.max(0.001, extremes.periapsisFlux + extremes.apoapsisFlux));
  const multiStarVariabilityIndex = clamp(fluxComponents.companionFraction * params.companionVariability + (params.starCount - 1) * .06);
  const orbitalPeriodHours = orbitalPeriodDays * 24;
  const solarDayHours = Math.min(10_000_000, 1 / Math.max(0.0000001, Math.abs(1 / params.rotationHours - 1 / orbitalPeriodHours)));
  const rotationOrbitRatio = params.rotationHours / orbitalPeriodHours;
  const effectiveAlbedo = effectivePlanetaryAlbedo(params, state.surface, state.atmosphere, state.atmospherePressureBar);
  const equilibriumTemperatureC = equilibriumTemperatureNoGreenhouse(params, effectiveAlbedo);
  const greenhouseDeltaC = state.surface.temperatureC - equilibriumTemperatureC;
  const absorbedStellarWm2 = 1361 * stellarFlux(params) * (1 - effectiveAlbedo) / 4;
  const cloudCover = cloudCoverIndex(state.atmosphere, state.atmospherePressureBar, state.surface.liquidWater, params.rotationHours);
  const hydrologicalCycleIndex = clamp(state.surface.liquidWater * clamp((state.surface.temperatureC + 12) / 60) * (0.55 + cloudCover * 0.45));
  const climateBufferIndex = clamp(Math.log1p(state.atmospherePressureBar) * 0.22 + state.surface.oceanCoverage * 0.42 + (1 - orbitalForcingAmplitude) * 0.2 + clamp(48 / params.rotationHours) * 0.16);
  const regime = climateRegime(state.surface.temperatureC, state.surface.liquidWater, state.surface.ice);
  const snowballRisk = clamp(state.surface.ice * 0.7 + clamp((5 - state.surface.temperatureC) / 45) * 0.3);
  const runawayGreenhouseRisk = clamp(clamp((state.surface.temperatureC - 45) / 55) * 0.55 + clamp((stellarFlux(params) - 0.9) / 0.6) * state.atmosphere.h2o * 0.8);
  const atmosphericCollapseRisk = clamp(clamp((0.18 - state.atmospherePressureBar) / 0.18) * 0.55 + clamp((-35 - state.surface.temperatureC) / 70) * 0.25 + (1 - gravityEarth) * 0.2);
  const hz = habitableZoneFluxLimits(params.starTemperatureK);
  const currentStellarClass = stellarClass(params.starTemperatureK);
  const stellarMainSequenceLifetimeGyr = clamp(10 * Math.pow(params.starMassSolar, -2.5), 0.2, 100);
  const currentStarAgeGyr = params.starAgeGyr + state.ageMyr / 1000;
  const stellarAgeFraction = clamp(currentStarAgeGyr / stellarMainSequenceLifetimeGyr);
  const highEnergyFluxIndex = clamp(effectiveStellarActivity(params, state.ageMyr) * stellarFlux(params) * (currentStellarClass === "M" ? 1.18 : 0.86));
  const spectralMatch = Math.exp(-Math.pow((params.starTemperatureK - 5350) / 2450, 2));
  const photosyntheticPhotonIndex = clamp(stellarFlux(params) * spectralMatch * (1 - cloudCover * 0.3) / 1.15);
  const column = state.atmospherePressureBar * gravityEarth;
  const atmosphericRetentionIndex = clamp((escapeVelocityKmS / 11.186) * 0.52 + Math.log1p(column) * 0.26 - highEnergyFluxIndex * 0.28);
  const climateStabilityIndex = clamp((1 - orbitalForcingAmplitude) * 0.25 + climateBufferIndex * 0.28 + state.interior.tectonics * 0.18 + state.surface.liquidWater * 0.2 + (1 - Math.abs(params.axialTiltDeg - 23.4) / 90) * 0.09);
  const redoxDisequilibriumIndex = clamp((state.atmosphere.o2 * state.atmosphere.ch4 * 110) + state.chemistry.redoxGradient * 0.36);
  const closeOrbit = params.orbitalDistanceAu < 0.18 * Math.cbrt(params.starMassSolar);
  const tidalLockingRisk = closeOrbit || params.rotationHours > orbitalPeriodDays * 12 ? "high" : params.rotationHours > 96 || params.orbitalDistanceAu < 0.45 ? "moderate" : "low";
  const tectonicRegime = state.interior.tectonics > 0.58 ? "mobile lid" : state.interior.tectonics > 0.2 ? "episodic lid" : "stagnant lid";
  const internalHeatFluxIndex = clamp(state.interior.heat * 0.44 + state.interior.volcanism * 0.31 + params.radionuclides * 0.25);
  const thermalWeathering = clamp(1 - Math.abs(state.surface.temperatureC - 22) / 75);
  const weatheringFluxIndex = clamp(state.surface.landFraction * state.surface.liquidWater * thermalWeathering * (0.35 + state.interior.tectonics * 0.65) * 1.8);
  const seafloorWeatheringIndex = clamp(state.surface.oceanCoverage * state.surface.liquidWater * (0.28 + state.surface.hydrothermalActivity * 0.72));
  const outgassingFluxIndex = clamp(state.interior.outgassing * (0.55 + state.interior.volcanism * 0.45));
  const totalWeathering = weatheringFluxIndex + seafloorWeatheringIndex * 0.55;
  const carbonCycleBalance = clamp((outgassingFluxIndex - totalWeathering) / Math.max(0.05, outgassingFluxIndex + totalWeathering), -1, 1);
  const phosphorusAccess = clamp(state.chemistry.elements.phosphorus * 0.34 + weatheringFluxIndex * 0.38 + seafloorWeatheringIndex * (state.atmosphere.o2 < 0.05 ? 0.28 : 0.16));
  const nitrogenAccess = clamp(state.chemistry.elements.nitrogen * 0.38 + state.atmosphere.n2 * state.atmospherePressureBar * 0.22 + state.interior.volcanism * 0.12 + state.lineages.length * 0.008);
  const ironAccess = clamp(state.chemistry.elements.iron * 0.35 + state.surface.hydrothermalActivity * 0.42 + seafloorWeatheringIndex * 0.23 - state.atmosphere.o2 * 0.3);
  const oxygenicProduction = state.lineages.reduce((sum, lineage) => {
    const oxygenic = (lineage.metabolism === "phototroph" || lineage.metabolism === "mixotroph")
      && (lineage.structures.includes("chloroplast") || lineage.traits.photosynthesis > 0.72);
    return sum + (oxygenic ? lineage.biomass * lineage.traits.photosynthesis : 0);
  }, 0);
  const oxygenSinks = state.lineages.reduce((sum, lineage) => sum + lineage.biomass * lineage.traits.oxygenUse, 0) + state.interior.volcanism * 0.12 + state.atmosphere.ch4 * state.atmospherePressureBar;
  const oxygenPartialBar = state.atmosphere.o2 * state.atmospherePressureBar;
  const abioticOxygenRisk = clamp(highEnergyFluxIndex * (0.18 + clamp(1 - params.waterInventory / 1.5) * 0.38) * (oxygenPartialBar > 0.015 ? 0.75 : 0.35) * (1 - clamp(oxygenicProduction)));
  return {
    gravityEarth, escapeVelocityKmS, bulkDensityGcm3, orbitalPeriodDays, ...extremes,
    primaryStellarFlux: fluxComponents.primary, companionStellarFlux: fluxComponents.companion,
    companionFluxFraction: fluxComponents.companionFraction, multiStarVariabilityIndex, stellarArchitecture: params.starTopology,
    orbitalForcingAmplitude, solarDayHours, rotationOrbitRatio,
    equilibriumTemperatureC, greenhouseDeltaC, absorbedStellarWm2, effectiveAlbedo, cloudCoverIndex: cloudCover, hydrologicalCycleIndex,
    climateBufferIndex, climateRegime: regime, snowballRisk, runawayGreenhouseRisk, atmosphericCollapseRisk,
    habitableZoneInnerFlux: hz.inner, habitableZoneOuterFlux: hz.outer, stellarClass: currentStellarClass, stellarMainSequenceLifetimeGyr,
    stellarAgeFraction, highEnergyFluxIndex, photosyntheticPhotonIndex, atmosphericRetentionIndex, climateStabilityIndex,
    redoxDisequilibriumIndex, tidalLockingRisk, tectonicRegime, internalHeatFluxIndex, weatheringFluxIndex, seafloorWeatheringIndex,
    outgassingFluxIndex, carbonCycleBalance, phosphorusAccess, nitrogenAccess, ironAccess, abioticOxygenRisk,
    greenhouseContributionsC: greenhouseContributions(state.atmosphere, state.atmospherePressureBar), oxygenicProduction, oxygenSinks
  };
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

export function originDiagnostics(state: SimulationState): OriginDiagnostics {
  const { chemistry, origin, surface, params } = state;
  const feedstock = clamp((chemistry.simpleOrganics * 0.2 + chemistry.aminoAcids * 0.22 + chemistry.lipids * 0.24 + chemistry.nucleotides * 0.34) / 1.4);
  const energy = clamp(origin.energy * 0.5 + chemistry.redoxGradient * 0.32 + (1 - surface.radiation) * 0.18);
  const concentrationByTheory: Record<string, number> = {
    pond: surface.wetDryCycling * origin.wetDryCycling,
    "rna-first": surface.wetDryCycling * origin.wetDryCycling * (0.55 + chemistry.nucleotides * 0.35),
    hydrothermal: surface.hydrothermalActivity * origin.ventFlux,
    atmospheric: origin.energy * (0.4 + params.starActivity * 0.35),
    "uv-network": origin.energy * (0.38 + params.starActivity * 0.24) * (0.62 + origin.wetDryCycling * surface.wetDryCycling * 0.38),
    "ice-eutectic": surface.ice * 0.78 + (1 - surface.radiation) * 0.12,
    "mineral-template": origin.catalysts * (0.45 + surface.wetDryCycling * 0.35),
    "lipid-first": chemistry.lipids * 0.48 + surface.wetDryCycling * 0.42,
    exogenous: origin.exogenousDose * origin.recurrence,
    lithopanspermia: origin.exogenousDose * origin.survivalFraction,
    custom: Math.max(surface.wetDryCycling * origin.wetDryCycling, surface.hydrothermalActivity * origin.ventFlux, origin.exogenousDose * origin.recurrence) * 0.8
  };
  const concentration = clamp(concentrationByTheory[origin.theory] ?? concentrationByTheory.custom);
  const catalysis = clamp(origin.catalysts * 0.48 + surface.nutrients * 0.22 + surface.hydrothermalActivity * 0.2 + chemistry.elements.iron * 0.1);
  const compartment = clamp(chemistry.lipids * 0.46 + chemistry.polymers * 0.3 + concentration * 0.24);
  const heredity = clamp(chemistry.nucleotides * 0.48 + chemistry.polymers * 0.42 + chemistry.protocells * 0.1);
  const thermalStress = clamp(Math.abs(surface.temperatureC - 28) / 90);
  const dilution = clamp(surface.oceanCoverage - surface.wetDryCycling) * 0.26;
  const degradationPressure = clamp(surface.radiation * 0.38 + thermalStress * 0.32 + dilution + (1 - concentration) * 0.12);
  const gates: OriginGate[] = [
    { id: "feedstock", label: "Feedstock diversity", score: feedstock, detail: "Organic, amino-acid, lipid, and nucleotide analogue availability", confidence: "coarse" },
    { id: "energy", label: "Usable energy", score: energy, detail: "Chemical gradients and bounded photochemical input", confidence: "coarse" },
    { id: "concentration", label: "Concentration cycles", score: concentration, detail: `Model context alignment for the ${origin.theory.replaceAll("-", " ")} protocol`, confidence: "coarse" },
    { id: "catalysis", label: "Catalytic surfaces", score: catalysis, detail: "Mineral, nutrient, and hydrothermal catalytic opportunity", confidence: "coarse" },
    { id: "compartment", label: "Compartment stability", score: compartment, detail: "Boundary formation from lipid and polymer analogues", confidence: "speculative" },
    { id: "heredity", label: "Heredity opportunity", score: heredity, detail: "Persistent informational and functional polymer opportunity", confidence: "speculative" }
  ];
  const limitingGate = gates.reduce((lowest, gate) => gate.score < lowest.score ? gate : lowest);
  const geometricSupport = Math.pow(gates.reduce((product, gate) => product * Math.max(0.0001, gate.score), 1), 1 / gates.length);
  const readiness = clamp((limitingGate.score * 0.48 + geometricSupport * 0.52) * (1 - degradationPressure * 0.58));
  const opportunityRatePerMyr = Math.pow(readiness, 3.4) * Math.max(0.01, 1.05 - params.originDifficulty) * 0.0021
    + (origin.theory === "lithopanspermia" ? origin.survivalFraction * origin.exogenousDose * 0.0004 : 0);
  const entryShielding = clamp(Math.log1p(state.atmospherePressureBar) / 2.2 + state.interior.magneticShield * 0.08);
  const deliverySurvivalIndex = clamp(origin.survivalFraction * (0.24 + entryShielding * 0.34 + (1 - surface.radiation) * 0.42));
  return { gates, limitingGate, readiness, degradationPressure, opportunityRatePerMyr, deliverySurvivalIndex };
}

export function prebioticReadiness(state: SimulationState): number {
  return originDiagnostics(state).readiness;
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
  const stellarActivity = effectiveStellarActivity(params, state.ageMyr);
  const erosion = stellarActivity * 0.000012 * dt / Math.max(0.18, gravity * state.atmospherePressureBar);
  const partials = atmospherePartialPressures(atmosphere, state.atmospherePressureBar);
  applyAtmosphereFlux(state, {
    n2: -partials.n2 * erosion * 0.18,
    co2: interior.outgassing * 0.000018 * dt - interior.tectonics * surface.liquidWater * 0.000012 * dt - partials.co2 * erosion * 0.08,
    h2o: interior.outgassing * 0.000008 * dt - Math.max(0, surface.temperatureC - 70) * 0.000001 * dt - partials.h2o * erosion * 0.2,
    so2: interior.volcanism * 0.000004 * dt - Math.min(partials.so2, 0.000006 * dt),
    h2: -partials.h2 * erosion * 4,
    nh3: -partials.nh3 * stellarActivity * 0.00002 * dt,
    ch4: -partials.ch4 * erosion * 0.35,
    o2: -partials.o2 * erosion * 0.12
  });

  const dynamicAlbedo = effectivePlanetaryAlbedo(params, surface, atmosphere, state.atmospherePressureBar);
  const targetTemperature = equilibriumTemperature(params, atmosphere, state.atmospherePressureBar, dynamicAlbedo);
  surface.temperatureC += (targetTemperature - surface.temperatureC) * clamp(dt * 0.015, 0.01, 0.3);
  const thermalLiquid = clamp(1 - Math.abs(surface.temperatureC - 18) / 76);
  const escapeLoss = Math.max(0, surface.temperatureC - 75) * erosion * 0.002 * dt;
  params.waterInventory = clamp(params.waterInventory - escapeLoss, 0, 1.5);
  surface.ice = clamp(params.waterInventory * clamp((5 - surface.temperatureC) / 72));
  surface.liquidWater = clamp(params.waterInventory * thermalLiquid - surface.ice * 0.18);
  surface.oceanCoverage = clamp(surface.liquidWater * (1 - surface.landFraction * 0.3));
  surface.radiation = clamp(stellarActivity / Math.max(0.2, state.atmospherePressureBar * gravity) * (0.92 - interior.magneticShield * 0.08));
  surface.hydrothermalActivity = clamp(interior.volcanism * surface.liquidWater * (0.4 + interior.tectonics * 0.6));
  surface.wetDryCycling = clamp(surface.landFraction * surface.liquidWater * (0.55 + params.axialTiltDeg / 75));
  const landWeathering = surface.landFraction * surface.liquidWater * clamp(1 - Math.abs(surface.temperatureC - 22) / 75);
  const seafloorWeathering = surface.oceanCoverage * surface.hydrothermalActivity;
  surface.nutrients = clamp(surface.nutrients + (interior.tectonics * landWeathering + seafloorWeathering * 0.65) * 0.000045 * dt - state.lineages.length * 0.000006 * dt);
  surface.ph = clamp(7.6 - atmosphere.co2 * state.atmospherePressureBar * 2.8 + interior.tectonics * 0.45, 2, 12);

  const energyChemistry = state.origin.energy * (0.35 + stellarActivity * 0.28 + interior.volcanism * 0.37);
  const catalytic = state.origin.catalysts * (0.35 + surface.nutrients * 0.25 + surface.hydrothermalActivity * 0.4);
  const organicGain = (energyChemistry + state.origin.exogenousDose * state.origin.recurrence * 0.2) * 0.00013 * dt;
  const thermalDegradation = clamp(Math.abs(surface.temperatureC - 28) / 100);
  const dilutionPressure = clamp(surface.oceanCoverage - surface.wetDryCycling) * 0.000012 * dt;
  chemistry.simpleOrganics = clamp(chemistry.simpleOrganics + organicGain - (surface.radiation * 0.000035 + thermalDegradation * 0.000014) * dt, 0, 3);
  chemistry.aminoAcids = clamp(chemistry.aminoAcids + chemistry.simpleOrganics * catalytic * 0.000065 * dt - dilutionPressure * 0.34, 0, 2);
  chemistry.lipids = clamp(chemistry.lipids + chemistry.simpleOrganics * (0.3 + surface.wetDryCycling) * 0.000047 * dt - surface.radiation * 0.000004 * dt, 0, 2);
  chemistry.nucleotides = clamp(chemistry.nucleotides + chemistry.simpleOrganics * catalytic * surface.liquidWater * 0.00003 * dt - (thermalDegradation * 0.000006 * dt + dilutionPressure * 0.52), 0, 2);
  const polymerization = chemistry.aminoAcids * chemistry.nucleotides * (surface.wetDryCycling * state.origin.wetDryCycling + surface.hydrothermalActivity * state.origin.ventFlux) * 0.000018 * dt;
  chemistry.polymers = clamp(chemistry.polymers + polymerization - (surface.radiation * 0.000008 + thermalDegradation * 0.000005) * dt - dilutionPressure * 0.24, 0, 2);
  chemistry.redoxGradient = clamp(surface.hydrothermalActivity * 0.52 + atmosphere.h2 * 0.24 + atmosphere.co2 * 0.18 + atmosphere.o2 * 0.38);
}
