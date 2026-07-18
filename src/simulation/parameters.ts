import type { EvidenceClass, PlanetParams } from "./types";

export type NumericPlanetKey = {
  [K in keyof PlanetParams]: PlanetParams[K] extends number ? K : never
}[keyof PlanetParams];

export type ParameterField = {
  key: NumericPlanetKey;
  label: string;
  short: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  group: "system" | "world" | "interior" | "surface" | "evolution";
  description: string;
  evidence: EvidenceClass;
  sourceIds: string[];
  advanced?: boolean;
  companionOnly?: boolean;
};

export const PARAMETER_FIELDS: ParameterField[] = [
  { key: "starCount", label: "Number of stars", short: "Stars", min: 1, max: 3, step: 1, group: "system", description: "One primary plus zero, one, or two representative companion components. Multiple-star forcing is an aggregate proxy, not an orbital integration.", evidence: "coarse", sourceIds: ["cukier-2019"] },
  { key: "starMassSolar", label: "Primary stellar mass", short: "Primary mass", min: .1, max: 2, step: .01, unit: "M⊙", group: "system", description: "Primary-star mass relative to the Sun; it strongly affects luminosity history and main-sequence lifetime.", evidence: "grounded", sourceIds: ["kopparapu-2014"] },
  { key: "starLuminositySolar", label: "Primary luminosity", short: "Primary light", min: .003, max: 8, step: .01, unit: "L⊙", group: "system", description: "Bolometric energy output relative to the Sun. Flux falls with the square of orbital distance.", evidence: "grounded", sourceIds: ["kopparapu-2014"] },
  { key: "starTemperatureK", label: "Primary temperature", short: "Spectrum", min: 2600, max: 7200, step: 10, unit: "K", group: "system", description: "Effective temperature controls stellar class and the wavelength-dependent conventional habitable-zone correction.", evidence: "grounded", sourceIds: ["kopparapu-2014"] },
  { key: "starActivity", label: "High-energy activity", short: "Activity", min: 0, max: 1, step: .01, group: "system", description: "A coarse ultraviolet, X-ray, flare, and particle-stress index. Helpful photochemistry and destructive radiation are not spectrally separated.", evidence: "coarse", sourceIds: ["kopparapu-2014"] },
  { key: "starAgeGyr", label: "System age", short: "Age", min: .05, max: 13.5, step: .05, unit: "Gyr", group: "system", description: "Age when the experiment begins. The engine then advances geological time from this baseline.", evidence: "grounded", sourceIds: ["catling-zahnle-2020"] },
  { key: "companionMassSolar", label: "Companion mass each", short: "Companion mass", min: .08, max: 2, step: .01, unit: "M⊙", group: "system", description: "Representative mass for each companion. Triple systems reuse this value for two aggregate companion components.", evidence: "coarse", sourceIds: ["cukier-2019"], advanced: true, companionOnly: true },
  { key: "companionLuminositySolar", label: "Companion luminosity each", short: "Companion light", min: .001, max: 8, step: .01, unit: "L⊙", group: "system", description: "Representative luminosity added at the configured mean planet-to-companion distance.", evidence: "coarse", sourceIds: ["cukier-2019"], companionOnly: true },
  { key: "companionTemperatureK", label: "Companion temperature", short: "Companion spectrum", min: 2400, max: 9000, step: 10, unit: "K", group: "system", description: "Representative companion spectrum. The current climate proxy does not fully combine two spectral response curves.", evidence: "coarse", sourceIds: ["cukier-2019"], advanced: true, companionOnly: true },
  { key: "companionDistanceAu", label: "Mean companion distance", short: "Companion distance", min: .05, max: 100, step: .01, unit: "AU", group: "system", description: "Time-averaged planet-to-companion separation used only for irradiance. It is not a binary semimajor axis or stability solution.", evidence: "coarse", sourceIds: ["kane-2013"], companionOnly: true },
  { key: "companionVariability", label: "Companion variability", short: "Flux variation", min: 0, max: 1, step: .01, group: "system", description: "Exploratory amplitude for eclipses and changing separation. It widens displayed forcing extremes but does not integrate orbital phase.", evidence: "speculative", sourceIds: ["cukier-2019"], companionOnly: true },
  { key: "orbitalDistanceAu", label: "Orbital distance", short: "Orbit", min: .03, max: 4, step: .01, unit: "AU", group: "system", description: "Primary-star distance proxy. In multiple-star experiments this remains the primary component distance.", evidence: "grounded", sourceIds: ["kopparapu-2014"] },
  { key: "orbitalEccentricity", label: "Orbital eccentricity", short: "Eccentricity", min: 0, max: .8, step: .001, group: "system", description: "Departure from a circular orbit. High values widen periapsis-to-apoapsis forcing beyond what a global mean climate resolves.", evidence: "grounded", sourceIds: ["kopparapu-2014"] },
  { key: "planetMassEarth", label: "Planet mass", short: "Mass", min: .2, max: 5, step: .05, unit: "M⊕", group: "world", description: "Mass controls surface gravity, escape velocity, and the atmosphere-retention proxy.", evidence: "grounded", sourceIds: [] },
  { key: "planetRadiusEarth", label: "Planet radius", short: "Radius", min: .5, max: 2, step: .02, unit: "R⊕", group: "world", description: "Radius combines with mass to set density and gravity. It is user-specified rather than derived from an equation of state.", evidence: "grounded", sourceIds: [] },
  { key: "rotationHours", label: "Rotation period", short: "Rotation", min: 4, max: 1000, step: 1, unit: "h", group: "world", description: "Sidereal rotation proxy affecting dynamo support, cloud response, and tidal-locking context.", evidence: "coarse", sourceIds: [] },
  { key: "axialTiltDeg", label: "Axial tilt", short: "Tilt", min: 0, max: 90, step: .1, unit: "°", group: "world", description: "Obliquity influences the model's wet–dry opportunity and stability index; latitude and seasons are not spatially resolved.", evidence: "coarse", sourceIds: [] },
  { key: "albedo", label: "Baseline albedo", short: "Reflectivity", min: .05, max: .75, step: .01, group: "surface", description: "Fraction of incident light reflected before ice, ocean, and cloud feedback proxies are applied.", evidence: "coarse", sourceIds: [] },
  { key: "waterInventory", label: "Water inventory", short: "Water", min: 0, max: 1.5, step: .01, group: "surface", description: "Accessible water relative to the model reference. Deep-ocean pressure and high-pressure ice are outside the engine.", evidence: "coarse", sourceIds: [] },
  { key: "landFraction", label: "Exposed land fraction", short: "Land", min: 0, max: .95, step: .01, group: "surface", description: "Exposed surface fraction available for weathering and concentration cycles.", evidence: "coarse", sourceIds: [] },
  { key: "coreFraction", label: "Core mass fraction", short: "Core", min: .05, max: .7, step: .01, group: "interior", description: "Bulk core proxy feeding density and dynamo opportunity. Core and mantle are normalized below 98 percent together.", evidence: "coarse", sourceIds: [] },
  { key: "mantleFraction", label: "Mantle mass fraction", short: "Mantle", min: .2, max: .9, step: .01, group: "interior", description: "Rocky mantle proxy controlling heat and volatile outgassing reservoirs.", evidence: "coarse", sourceIds: [] },
  { key: "initialHeat", label: "Retained interior heat", short: "Heat", min: 0, max: 1, step: .01, group: "interior", description: "Starting secular heat index; higher heat supports volcanism and hydrothermal circulation but can increase disruption.", evidence: "coarse", sourceIds: [] },
  { key: "radionuclides", label: "Radiogenic heat", short: "Radiogenic", min: 0, max: 1, step: .01, group: "interior", description: "Long-lived heat-production index that slows interior cooling.", evidence: "coarse", sourceIds: [] },
  { key: "tectonicMobility", label: "Tectonic mobility", short: "Tectonics", min: 0, max: 1, step: .01, group: "interior", description: "Potential for mobile-lid recycling, weathering, nutrient exposure, and volatile exchange.", evidence: "coarse", sourceIds: [] },
  { key: "impactRate", label: "Background impact rate", short: "Impacts", min: 0, max: 1, step: .01, group: "evolution", description: "Statistical impact forcing distinct from scheduled intervention events.", evidence: "coarse", sourceIds: ["callahan-2011"] },
  { key: "atmospherePressureBar", label: "Surface pressure", short: "Pressure", min: .01, max: 20, step: .01, unit: "bar", group: "surface", description: "Total atmospheric surface pressure. Gas controls are normalized fractions; the interface also displays partial pressures.", evidence: "grounded", sourceIds: [] },
  { key: "mutationRate", label: "Mutation pressure", short: "Variation", min: .02, max: 1, step: .01, group: "evolution", description: "Model variation rate, not a molecular mutation probability. Higher values explore phenotype space faster with greater instability.", evidence: "speculative", sourceIds: [] },
  { key: "originDifficulty", label: "Origin barrier", short: "Origin barrier", min: .05, max: 1, step: .01, group: "evolution", description: "Internal experiment barrier scaling origin opportunities. It has no empirical calibration and must not be read as probability.", evidence: "speculative", sourceIds: [] }
];

export const parameterByKey = Object.fromEntries(PARAMETER_FIELDS.map((field) => [field.key, field])) as Record<NumericPlanetKey, ParameterField>;
