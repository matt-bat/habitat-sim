import { describe, expect, test } from "vitest";
import { parameterGuidance, evaluateGuidance, configurationErrors } from "../src/simulation/guidance";
import { getScenario, scenarioConfiguration } from "../src/simulation/presets";

describe("adaptive scientific guidance", () => {
  test("responds to coupled multi-star, water-world, oxygen, and ammonia settings", () => {
    const configuration = scenarioConfiguration(getScenario("circumbinary-shore"), "guided-world");
    configuration.params.waterInventory = 1.2;
    configuration.params.landFraction = .03;
    configuration.params.atmospherePressureBar = 2;
    configuration.params.atmosphere.o2 = .01;
    configuration.params.atmosphere.nh3 = .03;
    configuration.params.starActivity = .9;
    const ids = evaluateGuidance(configuration).map((item) => item.id);
    expect(ids).toContain("multi-star");
    expect(ids).toContain("water-world");
    expect(ids).toContain("prelife-oxygen");
    expect(ids).toContain("ammonia-photolysis");
  });

  test("field help contains a current consequence, causal chain, confidence, and boundary", () => {
    const configuration = scenarioConfiguration(getScenario("late-hadean-shore"), "field-help");
    const note = parameterGuidance("orbitalDistanceAu", configuration);
    expect(note.summary).toContain("S⊕");
    expect(note.causalChain).toContain("→");
    expect(note.evidence).toBeTruthy();
    expect(note.modelBoundary.length).toBeGreaterThan(20);
  });

  test("blocks stellar ages outside the modeled main sequence", () => {
    const configuration = scenarioConfiguration(getScenario("late-hadean-shore"), "expired-star");
    configuration.params.starMassSolar = 2;
    configuration.params.starAgeGyr = 13;
    expect(configurationErrors(configuration).join(" ")).toMatch(/main-sequence/i);
  });
});
