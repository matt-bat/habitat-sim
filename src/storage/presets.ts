import { DEFAULT_ORIGIN } from "../simulation/constants";
import { normalizeParams } from "../simulation/planet";
import type { InterventionType, OriginConfig, OriginTheoryId, PlannedIntervention, ScenarioConfiguration, UserPreset, WizardDraft } from "../simulation/types";

export const PRESET_STORAGE_KEY = "habitat-sim.presets.v1";
export const DRAFT_STORAGE_KEY = "habitat-sim.wizard-draft.v1";
export const MAX_USER_PRESETS = 32;
export const MAX_PRESET_BYTES = 300_000;

const ORIGIN_IDS = new Set<OriginTheoryId>(["pond", "rna-first", "hydrothermal", "atmospheric", "uv-network", "ice-eutectic", "mineral-template", "lipid-first", "exogenous", "lithopanspermia", "custom"]);
const INTERVENTION_IDS = new Set<InterventionType>(["organic-asteroid", "ice-comet", "microbial-seed", "fungal-spores", "stellar-flare", "quiet-star", "volcanic-pulse", "nutrient-deposition", "sterilizing-impact", "custom"]);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function normalizeOrigin(input: unknown): OriginConfig {
  const value = isRecord(input) ? input : {};
  const theory = ORIGIN_IDS.has(value.theory as OriginTheoryId) ? value.theory as OriginTheoryId : DEFAULT_ORIGIN.theory;
  const result = { ...DEFAULT_ORIGIN, theory };
  for (const key of ["energy", "catalysts", "wetDryCycling", "ventFlux", "exogenousDose", "recurrence", "survivalFraction"] as const) {
    result[key] = Math.max(0, Math.min(1, finite(value[key], result[key])));
  }
  return result;
}

function normalizeInterventions(input: unknown): PlannedIntervention[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 64).flatMap((item): PlannedIntervention[] => {
    if (!isRecord(item) || !INTERVENTION_IDS.has(item.type as InterventionType) || typeof item.label !== "string" || !isRecord(item.cargo)) return [];
    const cargo = Object.fromEntries(Object.entries(item.cargo).filter(([, value]) => Number.isFinite(Number(value))).map(([key, value]) => [key, Math.max(0, Math.min(1, Number(value)))]));
    return [{ type: item.type as InterventionType, label: item.label.slice(0, 120), scheduledAgeMyr: Math.max(0, Math.min(20_000, finite(item.scheduledAgeMyr, 0))), magnitude: Math.max(.01, Math.min(1, finite(item.magnitude, .5))), cargo }];
  });
}

export function normalizeConfiguration(input: unknown): ScenarioConfiguration {
  if (!isRecord(input)) throw new Error("Preset configuration must be an object.");
  const seed = String(input.seed || "preset-world").trim().slice(0, 120) || "preset-world";
  return {
    seed,
    params: normalizeParams({ ...(isRecord(input.params) ? input.params : {}), seed }),
    origin: normalizeOrigin(input.origin),
    interventions: normalizeInterventions(input.interventions),
    runHorizonMyr: Math.max(1, Math.min(20_000, finite(input.runHorizonMyr, 4500)))
  };
}

export function createUserPreset(configuration: ScenarioConfiguration, name: string, description = "", basePresetId?: string, previous?: UserPreset): UserPreset {
  const now = new Date().toISOString();
  const safeName = name.trim().slice(0, 80) || "Untitled world";
  return {
    schemaVersion: 1,
    modelVersion: "1.1",
    id: previous?.id ?? `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ownership: "user",
    name: safeName,
    description: description.trim().slice(0, 500),
    category: "user",
    evidence: previous?.evidence ?? "speculative",
    basePresetId,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    configuration: normalizeConfiguration(configuration)
  };
}

function normalizePreset(value: unknown): UserPreset | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.modelVersion !== "1.1" || value.ownership !== "user" || typeof value.id !== "string" || typeof value.name !== "string") return null;
  try {
    return {
      schemaVersion: 1, modelVersion: "1.1", ownership: "user", category: "user",
      id: value.id.slice(0, 120), name: value.name.slice(0, 80), description: typeof value.description === "string" ? value.description.slice(0, 500) : "",
      evidence: value.evidence === "grounded" || value.evidence === "coarse" ? value.evidence : "speculative",
      basePresetId: typeof value.basePresetId === "string" ? value.basePresetId.slice(0, 120) : undefined,
      createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date(0).toISOString(),
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
      configuration: normalizeConfiguration(value.configuration)
    };
  } catch { return null; }
}

export function loadUserPresets(storage: Storage = localStorage): UserPreset[] {
  try {
    const parsed = JSON.parse(storage.getItem(PRESET_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePreset).filter((item): item is UserPreset => Boolean(item)).slice(0, MAX_USER_PRESETS);
  } catch { return []; }
}

export function persistUserPresets(items: UserPreset[], storage: Storage = localStorage): void {
  storage.setItem(PRESET_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_USER_PRESETS)));
}

export function presetToJson(preset: UserPreset): string {
  return JSON.stringify({ app: "habitat-sim-preset", version: 1, exportedAt: new Date().toISOString(), preset }, null, 2);
}

export function parsePresetJson(text: string): UserPreset {
  if (new TextEncoder().encode(text).byteLength > MAX_PRESET_BYTES) throw new Error("Preset exceeds 300 KB.");
  const value: unknown = JSON.parse(text);
  if (!isRecord(value) || value.app !== "habitat-sim-preset" || value.version !== 1) throw new Error("Unsupported preset file.");
  const preset = normalizePreset(value.preset);
  if (!preset) throw new Error("Preset schema or values are invalid.");
  return preset;
}

export function loadWizardDraft(storage: Storage = localStorage): WizardDraft | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(DRAFT_STORAGE_KEY) || "null");
    if (!isRecord(value) || value.schemaVersion !== 1 || typeof value.sourcePresetId !== "string" || typeof value.updatedAt !== "string") return null;
    return { schemaVersion: 1, sourcePresetId: value.sourcePresetId, selectedCategory: ["earth-history", "plausible", "experimental", "user", "all"].includes(String(value.selectedCategory)) ? value.selectedCategory as WizardDraft["selectedCategory"] : "all", configuration: normalizeConfiguration(value.configuration), dirty: Boolean(value.dirty), updatedAt: value.updatedAt };
  } catch { return null; }
}

export function persistWizardDraft(draft: WizardDraft, storage: Storage = localStorage): void {
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearWizardDraft(storage: Storage = localStorage): void {
  storage.removeItem(DRAFT_STORAGE_KEY);
}
