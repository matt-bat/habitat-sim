import { describe, expect, test } from "vitest";
import { getScenario, scenarioConfiguration } from "../src/simulation/presets";
import {
  createUserPreset, loadUserPresets, loadWizardDraft, parsePresetJson, persistUserPresets, persistWizardDraft, presetToJson
} from "../src/storage/presets";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

describe("preset and draft persistence", () => {
  test("round-trips reusable presets separately from simulation state", () => {
    const storage = new MemoryStorage();
    const configuration = scenarioConfiguration(getScenario("eoarchean-vents"), "saved-vents");
    const preset = createUserPreset(configuration, "My vent experiment", "A modified setup", "eoarchean-vents");
    persistUserPresets([preset], storage);
    const loaded = loadUserPresets(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].configuration).toEqual(preset.configuration);
    expect(loaded[0].basePresetId).toBe("eoarchean-vents");
    expect(JSON.stringify(loaded[0])).not.toContain("timeline");
  });

  test("exports validated metadata and safely rejects unsupported envelopes", () => {
    const preset = createUserPreset(scenarioConfiguration(getScenario("old-k-super-earth"), "export-me"), "Orange world", "", "old-k-super-earth");
    expect(parsePresetJson(presetToJson(preset))).toEqual(expect.objectContaining({ name: "Orange world", modelVersion: "1.1" }));
    expect(() => parsePresetJson(JSON.stringify({ app: "something-else", version: 1 }))).toThrow(/unsupported/i);
  });

  test("autosaved wizard drafts retain exact values and step category", () => {
    const storage = new MemoryStorage();
    const configuration = scenarioConfiguration(getScenario("hadean-cooling"), "draft-seed");
    configuration.params.orbitalEccentricity = .233;
    const draft = { schemaVersion: 1 as const, sourcePresetId: "hadean-cooling", selectedCategory: "earth-history" as const, configuration, dirty: true, updatedAt: new Date().toISOString() };
    persistWizardDraft(draft, storage);
    expect(loadWizardDraft(storage)?.configuration.params.orbitalEccentricity).toBeCloseTo(.233);
  });
});
