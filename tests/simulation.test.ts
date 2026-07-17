import { describe, expect, it } from "vitest";
import { DEFAULT_ORIGIN, DEFAULT_PARAMS } from "../src/simulation/constants";
import { deterministicFingerprint, HabitatSimulation } from "../src/simulation/engine";
import { defaultIntervention } from "../src/simulation/interventions";
import { createSeededLineage } from "../src/simulation/life";
import { applyAtmosphereFlux, atmospherePartialPressures, habitableZoneFluxLimits, planetObservables, stellarFlux, normalizeParams } from "../src/simulation/planet";
import { makeRandom } from "../src/simulation/random";

describe("HabitatSimulation", () => {
  it("normalizes unsafe planet and atmosphere input", () => {
    const params = normalizeParams({
      ...DEFAULT_PARAMS,
      orbitalDistanceAu: -20,
      planetMassEarth: 99,
      atmospherePressureBar: Number.NaN,
      atmosphere: { ...DEFAULT_PARAMS.atmosphere, n2: 8, co2: -2, h2: Number.NaN }
    });
    expect(params.orbitalDistanceAu).toBe(.03);
    expect(params.planetMassEarth).toBe(5);
    expect(params.atmospherePressureBar).toBe(DEFAULT_PARAMS.atmospherePressureBar);
    expect(Object.values(params.atmosphere).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
    expect(params.atmosphere.co2).toBeGreaterThanOrEqual(0);
    expect(params.atmosphere.h2).toBeGreaterThan(0);
  });

  it("derives grounded Earth-scale orbital and gravity observables", () => {
    const simulation = new HabitatSimulation("observable-world", { ...DEFAULT_PARAMS, seed: "observable-world" }, DEFAULT_ORIGIN);
    const observables = planetObservables(simulation.state);
    expect(observables.gravityEarth).toBeCloseTo(1, 6);
    expect(observables.escapeVelocityKmS).toBeCloseTo(11.186, 3);
    expect(observables.orbitalPeriodDays).toBeCloseTo(365.256, 2);
    expect(simulation.state.surface.ph).toBeGreaterThanOrEqual(2);
    expect(simulation.state.surface.ph).toBeLessThanOrEqual(12);
  });

  it("accounts for eccentricity and stellar spectrum in orbital forcing", () => {
    const circular = stellarFlux({ ...DEFAULT_PARAMS, orbitalEccentricity: 0 });
    const eccentric = stellarFlux({ ...DEFAULT_PARAMS, orbitalEccentricity: .6 });
    const sun = habitableZoneFluxLimits(5780);
    const coolStar = habitableZoneFluxLimits(3200);
    expect(eccentric).toBeGreaterThan(circular);
    expect(sun.inner).toBeCloseTo(1.107, 3);
    expect(coolStar.inner).not.toBeCloseTo(sun.inner, 2);
  });

  it("adds gas as partial pressure without displacing existing inventory", () => {
    const simulation = new HabitatSimulation("ledger-world", { ...DEFAULT_PARAMS, seed: "ledger-world" }, DEFAULT_ORIGIN);
    const before = atmospherePartialPressures(simulation.state.atmosphere, simulation.state.atmospherePressureBar);
    applyAtmosphereFlux(simulation.state, { co2: .2 });
    const after = atmospherePartialPressures(simulation.state.atmosphere, simulation.state.atmospherePressureBar);
    expect(after.n2).toBeCloseTo(before.n2, 8);
    expect(after.co2).toBeCloseTo(before.co2 + .2, 8);
    expect(simulation.state.atmospherePressureBar).toBeCloseTo(1.2, 8);
  });

  it("replays identical seed, parameters, and interventions deterministically", () => {
    const run = () => {
      const simulation = new HabitatSimulation("repeatable-world", { ...DEFAULT_PARAMS, seed: "repeatable-world" }, DEFAULT_ORIGIN);
      simulation.addIntervention({ ...defaultIntervention("organic-asteroid", 120, 1), scheduledAgeMyr: 120 });
      simulation.addIntervention({ ...defaultIntervention("stellar-flare", 310, 2), scheduledAgeMyr: 310 });
      simulation.runTo(600);
      return simulation.getSummary();
    };
    expect(deterministicFingerprint(run())).toBe(deterministicFingerprint(run()));
  });

  it("allows a hostile planet to remain sterile", () => {
    const simulation = new HabitatSimulation("sterile-world", {
      ...DEFAULT_PARAMS,
      seed: "sterile-world",
      starLuminositySolar: 2.5,
      orbitalDistanceAu: .35,
      starActivity: 1,
      albedo: .08,
      waterInventory: .02,
      atmospherePressureBar: .03,
      initialHeat: .1,
      coreFraction: .08,
      originDifficulty: 1
    }, DEFAULT_ORIGIN);
    simulation.runTo(2_000);
    const summary = simulation.getSummary();
    expect(summary.state.lineages).toHaveLength(0);
    expect(summary.habitabilityScore).toBeLessThan(.35);
  });

  it("records measurable beneficial and harmful intervention effects", () => {
    const simulation = new HabitatSimulation("event-world", { ...DEFAULT_PARAMS, seed: "event-world" }, DEFAULT_ORIGIN);
    const beforeOrganics = simulation.state.chemistry.simpleOrganics;
    simulation.interveneNow("organic-asteroid");
    expect(simulation.state.chemistry.simpleOrganics).toBeGreaterThan(beforeOrganics);
    const population = createSeededLineage(simulation.state, makeRandom("event-lineage"), "microbial");
    population.population = 1_000_000;
    simulation.state.lineages.push(population);
    const beforePopulation = population.population;
    simulation.interveneNow("sterilizing-impact");
    expect(population.population).toBeLessThan(beforePopulation);
    expect(simulation.getSummary().state.timeline.filter((event) => event.kind === "intervention")).toHaveLength(2);
  });

  it("derives selection, structure, and trophic outcomes from lineage traits", () => {
    const simulation = new HabitatSimulation("ecology-world", { ...DEFAULT_PARAMS, seed: "ecology-world", mutationRate: .9 }, DEFAULT_ORIGIN);
    simulation.state.chemistry.polymers = 1;
    simulation.state.surface.nutrients = 1;
    simulation.state.surface.liquidWater = 1;
    simulation.state.surface.radiation = .05;
    const producer = createSeededLineage(simulation.state, makeRandom("producer"), "microbial");
    producer.id = "producer";
    producer.population = 2_000_000;
    producer.traits.photosynthesis = .95;
    producer.traits.size = .06;
    producer.metabolism = "phototroph";
    const predator = createSeededLineage(simulation.state, makeRandom("predator"), "microbial");
    predator.id = "predator";
    predator.population = 500_000;
    predator.traits.predation = .92;
    predator.traits.digestion = .82;
    predator.traits.mobility = .75;
    predator.traits.size = .2;
    predator.metabolism = "heterotroph";
    simulation.state.lineages.push(producer, predator);
    simulation.step(10);
    const summary = simulation.getSummary();
    const evolvedPredator = summary.state.lineages.find((lineage) => lineage.id === "predator");
    expect(summary.state.foodWeb.some((link) => link.sourceId === "predator" && link.targetId === "producer")).toBe(true);
    expect(["herbivore", "carnivore", "omnivore", "parasite"]).toContain(evolvedPredator?.trophicRole);
    expect(evolvedPredator?.preyIds).toContain("producer");
    expect(evolvedPredator?.diet.producers).toBeGreaterThan(0);
  });

  it("separates oxygenic production from generic photosynthesis", () => {
    const simulation = new HabitatSimulation("oxygen-world", { ...DEFAULT_PARAMS, seed: "oxygen-world" }, DEFAULT_ORIGIN);
    const phototroph = createSeededLineage(simulation.state, makeRandom("anoxygenic"), "microbial");
    phototroph.metabolism = "phototroph";
    phototroph.traits.photosynthesis = .6;
    phototroph.population = 1_000_000;
    phototroph.biomass = 2;
    simulation.state.lineages.push(phototroph);
    expect(planetObservables(simulation.state).oxygenicProduction).toBe(0);
    phototroph.traits.photosynthesis = .9;
    expect(planetObservables(simulation.state).oxygenicProduction).toBeGreaterThan(0);
  });

  it("exports and safely restores a bounded experiment", () => {
    const simulation = new HabitatSimulation("archive-world", { ...DEFAULT_PARAMS, seed: "archive-world" }, DEFAULT_ORIGIN);
    simulation.runTo(150);
    const restored = HabitatSimulation.fromExport(JSON.parse(simulation.exportExperiment()));
    expect(restored.getSummary().seed).toBe("archive-world");
    expect(restored.getSummary().ageMyr).toBe(150);
    expect(restored.state.timeline.length).toBeLessThanOrEqual(500);
  });

  it("normalizes non-finite imported pressure to the planet default", () => {
    const simulation = new HabitatSimulation("import-world", { ...DEFAULT_PARAMS, seed: "import-world" }, DEFAULT_ORIGIN);
    const payload = JSON.parse(simulation.exportExperiment());
    payload.state.atmospherePressureBar = "not-a-number";
    const restored = HabitatSimulation.fromExport(payload);
    expect(restored.state.atmospherePressureBar).toBe(DEFAULT_PARAMS.atmospherePressureBar);
  });

  it("rejects malformed nested records in imported experiments", () => {
    const simulation = new HabitatSimulation("unsafe-import", { ...DEFAULT_PARAMS, seed: "unsafe-import" }, DEFAULT_ORIGIN);
    const payload = JSON.parse(simulation.exportExperiment());
    payload.state.lineages = [{ id: "incomplete-lineage" }];
    expect(() => HabitatSimulation.fromExport(payload)).toThrow(/lineages/i);
  });
});
