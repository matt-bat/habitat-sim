import { describe, expect, test } from "vitest";
import { DEFAULT_PARAMS } from "../src/simulation/constants";
import { HabitatSimulation, deterministicFingerprint } from "../src/simulation/engine";
import { evaluateGuidance } from "../src/simulation/guidance";
import { makeChemistry, makeSurface, normalizeParams, stellarFluxComponents } from "../src/simulation/planet";
import { ORIGIN_SCENARIOS, SCENARIO_PRESETS, SCIENCE_SOURCES, getScenario, scenarioConfiguration } from "../src/simulation/presets";

describe("research scenario catalog", () => {
  test("contains uncertainty-labeled Earth analogues and at least five distinct origin mechanisms", () => {
    const earth = SCENARIO_PRESETS.filter((item) => item.category === "earth-history");
    expect(earth.length).toBeGreaterThanOrEqual(3);
    expect(ORIGIN_SCENARIOS.length).toBeGreaterThanOrEqual(7);
    expect(new Set(ORIGIN_SCENARIOS.map((item) => item.origin.theory)).size).toBeGreaterThanOrEqual(7);
    for (const item of earth) {
      const configuration = scenarioConfiguration(item, "earth-control");
      expect(configuration.params.starAgeGyr).toBeLessThan(1.5);
      expect(configuration.params.atmosphere.o2 * configuration.params.atmospherePressureBar).toBeLessThan(.001);
      expect(item.confidenceNote.length).toBeGreaterThan(20);
      expect(item.sourceIds.length).toBeGreaterThan(0);
    }
  });

  test("all built-ins normalize without mutation and every citation resolves", () => {
    for (const item of SCENARIO_PRESETS) {
      const before = structuredClone(item);
      const configuration = scenarioConfiguration(item, "catalog-test");
      expect(configuration.params.seed).toBe("catalog-test");
      expect(configuration.origin.theory).toBeTruthy();
      expect(item).toEqual(before);
      for (const sourceId of item.sourceIds) expect(SCIENCE_SOURCES[sourceId]?.url).toMatch(/^https:/);
    }
  });

  test("multi-star and accessible-element parameters materially enter initial conditions", () => {
    const single = normalizeParams({ ...DEFAULT_PARAMS, starCount: 1 });
    const binary = normalizeParams({ ...single, starCount: 2, starTopology: "circumbinary", companionLuminositySolar: .5, companionDistanceAu: 1 });
    expect(stellarFluxComponents(binary).total).toBeGreaterThan(stellarFluxComponents(single).total);
    const carbonPoor = normalizeParams({ ...single, elementBasis: { ...single.elementBasis, carbon: .12, sulfur: .91 } });
    const surface = makeSurface(carbonPoor, carbonPoor.atmosphere);
    expect(makeChemistry(carbonPoor, surface).elements.carbon).toBeCloseTo(.12);
    expect(makeChemistry(carbonPoor, surface).elements.sulfur).toBeGreaterThan(.91);
  });

  test("alternative-solvent boundary cases never invoke terrestrial lineage origination", () => {
    const configuration = scenarioConfiguration(getScenario("cryogenic-methane-boundary"), "methane-boundary");
    const simulation = new HabitatSimulation(configuration.seed, configuration.params, configuration.origin);
    simulation.runTo(5000);
    expect(simulation.state.params.biochemistryMode).toBe("unsupported-alternative");
    expect(simulation.state.lineages).toHaveLength(0);
    expect(evaluateGuidance(configuration).some((item) => item.id === "unsupported-biochemistry")).toBe(true);
  });
});

describe("checkpoint integrity", () => {
  test("version-two export resumes the exact random stream", () => {
    const configuration = scenarioConfiguration(getScenario("late-hadean-shore"), "resume-exact");
    const uninterrupted = new HabitatSimulation(configuration.seed, configuration.params, configuration.origin);
    uninterrupted.runTo(1200);
    const resumed = HabitatSimulation.fromExport(JSON.parse(uninterrupted.exportExperiment()));
    expect(deterministicFingerprint(resumed.getSummary())).toBe(deterministicFingerprint(uninterrupted.getSummary()));
    uninterrupted.runTo(2200);
    resumed.runTo(2200);
    expect(deterministicFingerprint(resumed.getSummary())).toBe(deterministicFingerprint(uninterrupted.getSummary()));
  });
});
