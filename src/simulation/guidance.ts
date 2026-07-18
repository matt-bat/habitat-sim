import { habitableZoneFluxLimits, orbitalExtremes, stellarFlux, stellarFluxComponents } from "./planet";
import { parameterByKey, type NumericPlanetKey } from "./parameters";
import type { ScenarioConfiguration, ScienceGuidance } from "./types";

const guidance = (value: ScienceGuidance): ScienceGuidance => value;

export function parameterGuidance(key: NumericPlanetKey, configuration: ScenarioConfiguration): ScienceGuidance {
  const { params, origin } = configuration;
  const field = parameterByKey[key];
  const current = params[key];
  const base: ScienceGuidance = guidance({
    id: `field-${key}`,
    title: field.label,
    summary: `${field.description} Current value: ${Number(current).toLocaleString()}${field.unit ? ` ${field.unit}` : ""}.`,
    causalChain: "Parameter → coupled planetary response → origin and evolutionary opportunity",
    evidence: field.evidence,
    tone: "neutral",
    sourceIds: field.sourceIds,
    modelBoundary: "Directional model guidance; it is not a measured forecast for a real planet."
  });
  if (key === "orbitalDistanceAu") {
    const range = orbitalExtremes(params);
    return { ...base, summary: `At the current luminosity this orbit receives ${stellarFlux(params).toFixed(2)} S⊕ on average and ${range.apoapsisFlux.toFixed(2)}–${range.periapsisFlux.toFixed(2)} S⊕ across the modeled orbit.`, causalChain: "Distance ↓ → irradiance ↑ by inverse square → warming and moist-greenhouse stress ↑", tone: params.orbitalEccentricity > .2 ? "attention" : "neutral" };
  }
  if (key === "waterInventory") return { ...base, summary: params.waterInventory > 1 && params.landFraction < .1 ? "This global ocean improves solvent continuity but suppresses wet–dry concentration and may isolate nutrients beneath deep water." : params.waterInventory < .15 ? "Scarce water can concentrate material locally, but persistent solvent availability and transport become the limiting opportunity." : "The current water–land balance supports both solvent continuity and some exposed concentration environments.", causalChain: `Water + land → hydrology and dilution → ${origin.theory.replaceAll("-", " ")} context alignment`, tone: params.waterInventory > 1 || params.waterInventory < .15 ? "attention" : "positive" };
  if (key === "tectonicMobility") return { ...base, summary: `At ${(params.tectonicMobility * 100).toFixed(0)}%, stronger recycling raises the model's weathering, accessible nutrients, outgassing, and hydrothermal opportunity. Net climate direction still depends on greenhouse inventory and land weathering.`, causalChain: "Mobility ↑ → recycling + weathering + vent flow ↑ → nutrient and climate feedbacks", tone: params.tectonicMobility < .15 ? "attention" : "positive" };
  if (key === "starActivity") return { ...base, summary: params.starActivity > .7 ? "The current young/active star raises both photochemical energy and destructive high-energy exposure; the engine combines wavelength channels into one coarse index." : "The present activity index reduces atmospheric-loss and radiation stress while retaining some photochemical input.", causalChain: "Activity ↑ → photochemistry ↑ and molecular degradation/escape ↑", tone: params.starActivity > .7 ? "attention" : "neutral" };
  if (key === "atmospherePressureBar") return { ...base, summary: `At ${params.atmospherePressureBar.toFixed(2)} bar, atmospheric column ${params.atmospherePressureBar < .18 ? "is vulnerable to collapse and weak shielding" : params.atmospherePressureBar > 5 ? "strongly broadens the greenhouse proxy beyond Earth-like validation" : "provides moderate thermal buffering and radiation shielding"}.`, causalChain: "Pressure → shielding + greenhouse broadening + volatile phase stability", tone: params.atmospherePressureBar < .18 || params.atmospherePressureBar > 5 ? "attention" : "positive" };
  if (key === "originDifficulty") return { ...base, summary: `The ${(params.originDifficulty * 100).toFixed(0)}% origin barrier scales only the model's stochastic opportunity rate. It is deliberately uncalibrated because abiogenesis frequency is unknown.`, causalChain: "Barrier ↑ → internal opportunity hazard ↓; chemistry gates remain unchanged", tone: "attention" };
  if (field.companionOnly) return { ...base, summary: `${field.description} With ${params.starCount} stars, companions provide ${(stellarFluxComponents(params).companionFraction * 100).toFixed(1)}% of mean modeled flux.`, causalChain: "Companion geometry → extra and time-varying flux → climate-buffer demand", tone: "attention" };
  return base;
}

export function evaluateGuidance(configuration: ScenarioConfiguration): ScienceGuidance[] {
  const { params, origin } = configuration;
  const items: ScienceGuidance[] = [];
  const components = stellarFluxComponents(params);
  const hz = habitableZoneFluxLimits(params.starTemperatureK);
  const extremes = orbitalExtremes(params);
  const expectedLuminosity = Math.pow(params.starMassSolar, 3.5);
  const stellarMismatch = Math.max(params.starLuminositySolar / Math.max(.001, expectedLuminosity), expectedLuminosity / Math.max(.001, params.starLuminositySolar));

  if (params.biochemistryMode === "unsupported-alternative") items.push(guidance({ id: "unsupported-biochemistry", title: "Terrestrial life engine disabled", summary: "This setup preserves climate, atmosphere, delivery, and chemical-inventory bookkeeping, but cannot originate or evolve non-aqueous life.", causalChain: "Alternative solvent selected → carbon–water origin and lineage rules suppressed", evidence: "speculative", tone: "critical", sourceIds: [], modelBoundary: "No methane/ammonia solvent kinetics, membrane model, or alternative hereditary polymer is implemented." }));

  if (params.starCount > 1) items.push(guidance({ id: "multi-star", title: "Multiple-star forcing is a proxy", summary: `${params.starCount} stars contribute ${components.total.toFixed(2)} S⊕; companion light is ${(components.companionFraction * 100).toFixed(1)}% with a ${(params.companionVariability * 100).toFixed(0)}% variability control.`, causalChain: "Companion light + geometry → varying irradiation → greater climate-buffer demand", evidence: "coarse", tone: "attention", sourceIds: ["cukier-2019", "kane-2013"], modelBoundary: "No N-body integration, eclipse timing, or orbital-stability solution is performed." }));
  if (stellarMismatch > 3) items.push(guidance({ id: "stellar-consistency", title: "Non-standard star", summary: "Mass and luminosity differ strongly from a simple main-sequence scaling. This is allowed for experiments, but lifetime and climate context are less reliable.", causalChain: "Inconsistent stellar controls → contradictory spectrum/lifetime assumptions", evidence: "coarse", tone: "critical", sourceIds: ["kopparapu-2014"], modelBoundary: "The engine does not fit an evolutionary stellar track." }));
  const lifetime = Math.max(.2, Math.min(100, 10 * Math.pow(params.starMassSolar, -2.5)));
  if (params.starAgeGyr > lifetime) items.push(guidance({ id: "post-main-sequence", title: "Age exceeds main-sequence proxy", summary: `Configured age ${params.starAgeGyr.toFixed(2)} Gyr exceeds the ${lifetime.toFixed(2)} Gyr lifetime proxy.`, causalChain: "High mass → short stable lifetime → configured star would have evolved", evidence: "grounded", tone: "critical", sourceIds: [], modelBoundary: "Evolved-star luminosity and radius are not modeled." }));
  if (params.starTemperatureK < 3900) items.push(guidance({ id: "m-dwarf", title: "Red-dwarf history matters", summary: "Low bolometric flux does not imply low radiation risk: long pre-main-sequence brightness, close-orbit tides, and persistent activity can erode water and atmosphere.", causalChain: "Cool low-mass star → close temperate orbit → tidal and high-energy stress", evidence: "coarse", tone: params.starActivity > .65 ? "critical" : "attention", sourceIds: ["kopparapu-2014"], modelBoundary: "Pre-main-sequence water loss and flare distributions are not integrated." }));
  if (params.orbitalEccentricity > .2) items.push(guidance({ id: "eccentricity", title: "Large seasonal forcing", summary: `Flux swings from ${extremes.apoapsisFlux.toFixed(2)} to ${extremes.periapsisFlux.toFixed(2)} S⊕. Orbit-average climate can hide seasonal freeze or heating extremes.`, causalChain: "Eccentricity ↑ → periapsis/apoapsis contrast ↑ → seasonal thermal stress", evidence: "grounded", tone: "attention", sourceIds: ["kopparapu-2014"], modelBoundary: "The climate is globally averaged and has no latitude or season grid." }));
  if (components.total > hz.inner || components.total < hz.outer) items.push(guidance({ id: "hz-context", title: "Outside the conservative flux band", summary: `${components.total.toFixed(2)} S⊕ lies ${components.total > hz.inner ? "inside the hot edge" : "beyond the cold edge"} for the primary spectrum. Atmosphere and subsurface energy can still change solvent conditions.`, causalChain: "Stellar spectrum + flux + atmosphere → possible surface-water climate", evidence: "coarse", tone: "attention", sourceIds: ["kopparapu-2014"], modelBoundary: "The conventional zone is context for surface liquid water, not a verdict on life." }));
  if (params.atmosphere.h2 > .5 && params.atmospherePressureBar > 5) items.push(guidance({ id: "h2-greenhouse", title: "Extended hydrogen greenhouse", summary: "A dense hydrogen envelope can extend warm conditions outward, but this engine's logarithmic warming proxy is not quantitatively valid for deep collision-induced absorption.", causalChain: "H₂ pressure ↑ → collision-induced absorption ↑ → outer-zone warming", evidence: "speculative", tone: "attention", sourceIds: ["pierrehumbert-2011", "madhusudhan-2021"], modelBoundary: "Deep-atmosphere convection, helium, and ocean boundary pressure are omitted." }));
  const oxygenBar = params.atmosphere.o2 * params.atmospherePressureBar;
  if (oxygenBar > .001) items.push(guidance({ id: "prelife-oxygen", title: "Pre-life oxygen inconsistency", summary: `${oxygenBar.toFixed(4)} bar O₂ conflicts with a strict anoxic early-Earth setup unless an abiotic oxygen mechanism is intended. Oxygen is not automatically a biosignature.`, causalChain: "O₂ inventory → redox state and metabolism opportunity; source attribution remains essential", evidence: "grounded", tone: "critical", sourceIds: ["catling-zahnle-2020"], modelBoundary: "Photochemical oxygen production is only a coarse risk index." }));
  if (params.atmosphere.nh3 > .015 && params.starActivity > .55) items.push(guidance({ id: "ammonia-photolysis", title: "Ammonia needs replenishment", summary: "Substantial ammonia under a young active star is photochemically fragile. Persistent abundance needs shielding or resupply absent from this setup.", causalChain: "High-energy photons → NH₃ destruction → reducing greenhouse/feedstock declines", evidence: "coarse", tone: "attention", sourceIds: ["cleaves-2008"], modelBoundary: "Wavelength-resolved photolysis is omitted." }));
  if (params.waterInventory > 1 && params.landFraction < .1) items.push(guidance({ id: "water-world", title: "Dilution competes with continuity", summary: "A global ocean supplies persistent solvent but weakens wet–dry concentration, exposed weathering, and phosphate access; vent hypotheses align better than surface cycling here.", causalChain: "Ocean fraction ↑ → dilution ↑ and dry land ↓ → vent pathway relative fit ↑", evidence: "coarse", tone: origin.theory === "hydrothermal" ? "positive" : "attention", sourceIds: ["sojo-2016"], modelBoundary: "Ocean depth and high-pressure seafloor isolation are not modeled." }));
  if (params.elementBasis.carbon < .4) items.push(guidance({ id: "carbon-poor", title: "Carbon-water analogue mismatch", summary: "Accessible carbon is low enough that the engine's polymer and lineage rules become an extrapolation. It does not implement a non-carbon genetic backbone.", causalChain: "Carbon availability ↓ → modeled organic feedstock ↓ → carbon-water lineage support ↓", evidence: "speculative", tone: "critical", sourceIds: [], modelBoundary: "All evolved lineages remain carbon/water analogues." }));
  return items.sort((a, b) => ({ critical: 0, attention: 1, positive: 2, neutral: 3 }[a.tone] - { critical: 0, attention: 1, positive: 2, neutral: 3 }[b.tone])).slice(0, 8);
}

export function configurationErrors(configuration: ScenarioConfiguration): string[] {
  const errors: string[] = [];
  const p = configuration.params;
  const lifetime = Math.max(.2, Math.min(100, 10 * Math.pow(p.starMassSolar, -2.5)));
  if (!configuration.seed.trim()) errors.push("A deterministic seed is required.");
  if (p.starAgeGyr > lifetime) errors.push("System age exceeds the current main-sequence lifetime proxy.");
  if (p.starCount === 1 && p.starTopology !== "single") errors.push("A single-star system must use single topology.");
  if (p.starCount === 2 && p.starTopology !== "circumbinary") errors.push("Two-star experiments require circumbinary proxy topology.");
  if (p.starCount === 3 && p.starTopology !== "hierarchical-triple") errors.push("Three-star experiments require hierarchical-triple proxy topology.");
  if (configuration.runHorizonMyr <= 0 || configuration.runHorizonMyr > 20_000) errors.push("Run horizon must be between 1 and 20,000 million years.");
  return errors;
}
