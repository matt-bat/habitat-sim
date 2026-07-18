import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Atom, BookOpen, Check, ChevronDown, CircleHelp,
  Copy, Download, FlaskConical, Globe2, Layers3, Orbit, Plus, Rocket, Save, Sparkles, Trash2, Upload, X
} from "lucide-react";
import { DEFAULT_ELEMENTS, ORIGIN_PRESETS } from "../../simulation/constants";
import { HabitatSimulation } from "../../simulation/engine";
import { configurationErrors, evaluateGuidance, parameterGuidance } from "../../simulation/guidance";
import { defaultIntervention } from "../../simulation/interventions";
import { PARAMETER_FIELDS, type NumericPlanetKey, type ParameterField } from "../../simulation/parameters";
import { normalizeParams } from "../../simulation/planet";
import { getScenario, SCENARIO_PRESETS, SCIENCE_SOURCES, scenarioConfiguration } from "../../simulation/presets";
import type {
  ElementId, EvidenceClass, GasId, InterventionType, OriginConfig, PlannedIntervention, ScenarioCategory,
  ScenarioConfiguration, ScienceGuidance, UserPreset, WizardDraft
} from "../../simulation/types";
import { makeSeed } from "../../simulation/random";
import { PanelTitle, Tag } from "../../components/Primitives";

const STEPS = [
  { id: "foundation", label: "Foundation", short: "Start", icon: Sparkles },
  { id: "system", label: "Star system", short: "System", icon: Orbit },
  { id: "world", label: "Planet body", short: "World", icon: Globe2 },
  { id: "surface", label: "Atmosphere", short: "Surface", icon: Layers3 },
  { id: "origin", label: "Origin chemistry", short: "Origin", icon: Atom },
  { id: "evolution", label: "Evolution plan", short: "Plan", icon: Activity },
  { id: "review", label: "Review + launch", short: "Review", icon: Rocket }
] as const;

const CATEGORY_LABELS: Array<[ScenarioCategory | "all", string]> = [
  ["all", "All built-ins"], ["earth-history", "Earth history"], ["plausible", "Origin theories"], ["experimental", "Experimental"], ["user", "My presets"]
];
const GAS_KEYS: GasId[] = ["n2", "co2", "h2o", "ch4", "o2", "h2", "nh3", "so2"];
const ELEMENT_KEYS: ElementId[] = ["carbon", "hydrogen", "nitrogen", "oxygen", "phosphorus", "sulfur", "iron"];
const INTERVENTIONS: Array<[InterventionType, string]> = [
  ["organic-asteroid", "Carbonaceous asteroid"], ["ice-comet", "Ice-rich comet"], ["nutrient-deposition", "Nutrient deposition"],
  ["volcanic-pulse", "Volcanic pulse"], ["stellar-flare", "Stellar flare"], ["quiet-star", "Quiet-star interval"],
  ["microbial-seed", "Speculative microbial seed"], ["fungal-spores", "Speculative fungal spores"], ["sterilizing-impact", "Sterilizing impact"]
];

type WizardProps = {
  initialDraft: WizardDraft;
  userPresets: UserPreset[];
  onDraftChange: (draft: WizardDraft) => void;
  onClose: () => void;
  onLaunch: (configuration: ScenarioConfiguration, sourcePresetId: string) => void;
  onSavePreset: (configuration: ScenarioConfiguration, name: string, sourcePresetId: string, existing?: UserPreset) => void;
  onDuplicatePreset: (preset: UserPreset) => void;
  onDeletePreset: (preset: UserPreset) => void;
  onRestorePreset: (preset: UserPreset) => void;
  onExportPreset: (preset: UserPreset) => void;
  onImportPreset: (file?: File) => void;
};

function evidenceLabel(evidence: EvidenceClass): string {
  return evidence === "grounded" ? "empirical component" : evidence === "coarse" ? "literature-inspired model" : "exploratory extrapolation";
}

function gasGuidance(gas: GasId, configuration: ScenarioConfiguration): ScienceGuidance {
  const p = configuration.params;
  const partial = p.atmosphere[gas] * p.atmospherePressureBar;
  const facts: Record<GasId, [string, string, EvidenceClass, string[]]> = {
    n2: ["Nitrogen supplies atmospheric mass and a potential biological nitrogen reservoir, but fixation is a separate gate.", "N₂ column → pressure buffering + nitrogen feedstock context", "grounded", ["catling-zahnle-2020"]],
    co2: ["Carbon dioxide contributes greenhouse warming, carbon feedstock, ocean acidity, and weathering feedbacks.", "CO₂ partial pressure ↑ → warming + acidity + weathering demand ↑", "coarse", ["catling-zahnle-2020"]],
    h2o: ["Atmospheric water is a vapor-column proxy separate from the surface inventory; condensation and evaporation are not mass-conserved between them.", "H₂O vapor ↑ → greenhouse/cloud proxy ↑; surface phase exchange omitted", "coarse", []],
    ch4: ["Methane is a reducing carbon source and greenhouse gas; high abundance can form organic haze that this model only approximates through albedo.", "CH₄ ↑ → greenhouse + reducing chemistry + potential haze ↑", "coarse", ["arney-2016"]],
    o2: ["Pre-life oxygen changes redox chemistry and can be abiotic. It should not be interpreted as a biosignature without source context.", "O₂ ↑ → oxidizing chemistry + aerobic opportunity; reduced feedstocks decline", "grounded", ["catling-zahnle-2020"]],
    h2: ["Hydrogen supports reducing chemistry and can warm dense atmospheres by collision-induced absorption, beyond the engine's quantitative climate validity.", "H₂ pressure ↑ → reducing power + extended greenhouse ↑", "coarse", ["pierrehumbert-2011"]],
    nh3: ["Ammonia is reducing and greenhouse-active but photochemically fragile under ultraviolet-rich young stars unless replenished or shielded.", "NH₃ + UV → rapid loss; sustained abundance needs a source", "coarse", ["cleaves-2008"]],
    so2: ["Sulfur dioxide traces volcanism, supplies reactive sulfur, and can cause short-lived warming or aerosol cooling not spectrally separated here.", "SO₂ outgassing → sulfur feedstock + competing radiative effects", "coarse", []]
  };
  const [description, chain, evidence, sourceIds] = facts[gas];
  const attention = (gas === "o2" && partial > .001) || (gas === "nh3" && p.starActivity > .55 && partial > .005) || (gas === "h2" && partial > 2.5);
  return { id: `gas-${gas}`, title: `${gas.toUpperCase()} partial pressure`, summary: `${description} Current partial pressure is ${partial.toFixed(4)} bar (${(p.atmosphere[gas] * 100).toFixed(2)}%).`, causalChain: chain, evidence, tone: attention ? "attention" : "neutral", sourceIds, modelBoundary: "Gas effects use global partial-pressure proxies; photochemistry, clouds, and vertical circulation are not reaction-network calculations." };
}

function elementGuidance(element: ElementId, configuration: ScenarioConfiguration): ScienceGuidance {
  const value = configuration.params.elementBasis[element];
  const roles: Record<ElementId, string> = { carbon: "organic backbones", hydrogen: "solvent and redox chemistry", nitrogen: "amino and nucleotide analogues", oxygen: "water and redox chemistry", phosphorus: "energy transfer and informational polymers", sulfur: "redox catalysis and amino-acid analogues", iron: "mineral catalysis and electron transfer" };
  return { id: `element-${element}`, title: `${element} availability`, summary: `The ${(value * 100).toFixed(0)} index represents accessible ${element} for ${roles[element]}; it is not the planet's bulk elemental percentage.`, causalChain: `Accessible ${element} → feedstock/catalytic opportunity → carbon–water lineage support`, evidence: "coarse", tone: value < .2 ? "attention" : "neutral", sourceIds: element === "iron" || element === "sulfur" ? ["lambert-2010"] : [], modelBoundary: "Mineral phases, speciation, salinity, and reaction kinetics are not resolved." };
}

function originControlGuidance(key: keyof OriginConfig, configuration: ScenarioConfiguration): ScienceGuidance {
  const value = Number(configuration.origin[key]);
  const label = key.replaceAll(/([A-Z])/g, " $1");
  return { id: `origin-${key}`, title: label, summary: `At ${(value * 100).toFixed(0)}, this control weights the ${configuration.origin.theory.replaceAll("-", " ")} protocol's internal gate alignment. Changing it does not establish that the mechanism occurred.`, causalChain: `${label} → one or more origin gates → bounded internal opportunity rate`, evidence: key === "survivalFraction" ? "speculative" : "coarse", tone: value > .85 ? "attention" : "neutral", sourceIds: [], modelBoundary: "Origin controls are comparative indices without empirical probability calibration." };
}

function ScienceHelp({ item, open, onToggle }: { item: ScienceGuidance; open: boolean; onToggle: () => void }) {
  const id = `science-${item.id.replaceAll(/[^a-z0-9-]/gi, "-")}`;
  return <span className="science-help-wrap">
    <button className="science-help-trigger" type="button" aria-label={`Science note: ${item.title}`} aria-expanded={open} aria-controls={id} onClick={onToggle}><CircleHelp size={15}/></button>
    {open && <aside className="science-popover" id={id} aria-label={`${item.title} science note`}>
      <div><strong>{item.title}</strong><button type="button" aria-label="Close science note" onClick={onToggle}><X size={14}/></button></div>
      <p>{item.summary}</p><small>{item.causalChain}</small>
      <footer><Tag tone={item.evidence}>{evidenceLabel(item.evidence)}</Tag></footer>
      <em>{item.modelBoundary}</em>
      {!!item.sourceIds.length && <nav aria-label="Sources">{item.sourceIds.map((sourceId) => SCIENCE_SOURCES[sourceId] && <a key={sourceId} href={SCIENCE_SOURCES[sourceId].url} target="_blank" rel="noreferrer">{SCIENCE_SOURCES[sourceId].attribution}, {SCIENCE_SOURCES[sourceId].year}</a>)}</nav>}
    </aside>}
  </span>;
}

function ParameterControl({ field, configuration, onChange, onFocus, helpOpen, onToggleHelp }: {
  field: ParameterField;
  configuration: ScenarioConfiguration;
  onChange: (key: NumericPlanetKey, value: number) => void;
  onFocus: (key: NumericPlanetKey) => void;
  helpOpen: boolean;
  onToggleHelp: () => void;
}) {
  const value = configuration.params[field.key];
  const note = parameterGuidance(field.key, configuration);
  const decimals = field.step < .01 ? 3 : field.step < .1 ? 2 : 0;
  return <label className="wizard-range" data-field={field.key}>
    <span><b>{field.label}</b><span><strong>{Number(value).toFixed(decimals)}</strong>{field.unit && <i>{field.unit}</i>}<ScienceHelp item={note} open={helpOpen} onToggle={onToggleHelp}/></span></span>
    <input aria-label={field.label} type="range" min={field.min} max={field.max} step={field.step} value={Number(value)} onFocus={() => onFocus(field.key)} onPointerEnter={() => onFocus(field.key)} onChange={(event) => onChange(field.key, Number(event.target.value))}/>
    <small>{note.summary}</small>
  </label>;
}

function ImpactLens({ guidance, focused }: { guidance: ScienceGuidance[]; focused: ScienceGuidance }) {
  return <aside className="impact-lens" aria-label="Adaptive impact lens">
    <header><span>Adaptive impact lens</span><Tag tone={focused.evidence}>{focused.evidence}</Tag></header>
    <h3>{focused.title}</h3><p>{focused.summary}</p>
    <div className="causal-chain"><i/><span>{focused.causalChain}</span></div>
    <small>{focused.modelBoundary}</small>
    {!!guidance.length && <div className="live-warnings"><strong>Coupled signals</strong>{guidance.slice(0, 4).map((item) => <article className={`signal-${item.tone}`} key={item.id}><i/><span><b>{item.title}</b><small>{item.summary}</small></span></article>)}</div>}
  </aside>;
}

function fieldSet(group: ParameterField["group"], configuration: ScenarioConfiguration, advanced: boolean) {
  return PARAMETER_FIELDS.filter((field) => field.group === group && (!field.companionOnly || configuration.params.starCount > 1) && (advanced || !field.advanced));
}

export function SimWizard(props: WizardProps) {
  const { initialDraft, userPresets } = props;
  const [step, setStep] = useState(0);
  const [configuration, setConfiguration] = useState<ScenarioConfiguration>(() => structuredClone(initialDraft.configuration));
  const [sourcePresetId, setSourcePresetId] = useState(initialDraft.sourcePresetId);
  const [category, setCategory] = useState<ScenarioCategory | "all">(initialDraft.selectedCategory);
  const [advanced, setAdvanced] = useState(false);
  const [activeField, setActiveField] = useState<NumericPlanetKey>("orbitalDistanceAu");
  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const [presetName, setPresetName] = useState(() => userPresets.find((item) => item.id === sourcePresetId)?.name ?? getScenario(sourcePresetId).label);
  const [interventionType, setInterventionType] = useState<InterventionType>("organic-asteroid");
  const [interventionAge, setInterventionAge] = useState(250);
  const [interventionMagnitude, setInterventionMagnitude] = useState(.6);
  const [deleteCandidate, setDeleteCandidate] = useState<UserPreset | null>(null);
  const [lastDeleted, setLastDeleted] = useState<UserPreset | null>(null);
  const [acknowledgedBoundary, setAcknowledgedBoundary] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const deferredConfiguration = useDeferredValue(configuration);
  const guidance = useMemo(() => evaluateGuidance(configuration), [configuration]);
  const focusedGuidance = useMemo(() => step === 4 ? originControlGuidance("energy", configuration) : parameterGuidance(activeField, configuration), [activeField, configuration, step]);
  const errors = useMemo(() => configurationErrors(configuration), [configuration]);
  const sourceScenario = SCENARIO_PRESETS.find((item) => item.id === sourcePresetId);
  const userSource = userPresets.find((item) => item.id === sourcePresetId);
  const outsideModel = sourceScenario?.modelFit === "outside-model" || configuration.params.biochemistryMode === "unsupported-alternative";
  const preview = useMemo(() => {
    try { return new HabitatSimulation(deferredConfiguration.seed, deferredConfiguration.params, deferredConfiguration.origin).getSummary(); }
    catch { return null; }
  }, [deferredConfiguration]);

  useEffect(() => {
    const timer = window.setTimeout(() => props.onDraftChange({ schemaVersion: 1, sourcePresetId, selectedCategory: category, configuration, dirty: true, updatedAt: new Date().toISOString() }), 180);
    return () => window.clearTimeout(timer);
  }, [category, configuration, props.onDraftChange, sourcePresetId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openHelp) { event.preventDefault(); setOpenHelp(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openHelp]);

  useEffect(() => {
    const defaultFields: NumericPlanetKey[] = ["orbitalDistanceAu", "orbitalDistanceAu", "planetMassEarth", "waterInventory", "originDifficulty", "mutationRate", "originDifficulty"];
    setActiveField(defaultFields[step]);
  }, [step]);

  const updateParam = (key: NumericPlanetKey, value: number) => setConfiguration((current) => {
    const next = normalizeParams({ ...current.params, [key]: value });
    if (key === "starCount") next.starTopology = value === 1 ? "single" : value === 2 ? "circumbinary" : "hierarchical-triple";
    return { ...current, params: next };
  });
  const updateOrigin = (patch: Partial<OriginConfig>) => setConfiguration((current) => ({ ...current, origin: { ...current.origin, ...patch } }));
  const selectBuiltIn = (id: string) => {
    const selected = getScenario(id);
    const next = scenarioConfiguration(selected, configuration.seed || makeSeed());
    setConfiguration(next); setSourcePresetId(id); setPresetName(selected.label); setAcknowledgedBoundary(false);
  };
  const selectUser = (preset: UserPreset) => {
    setConfiguration(structuredClone(preset.configuration)); setSourcePresetId(preset.id); setPresetName(preset.name); setAcknowledgedBoundary(false);
  };
  const goNext = () => {
    if (step === STEPS.length - 1) return;
    if (step === 1 && errors.some((item) => item.includes("star") || item.includes("System"))) { errorRef.current?.focus(); return; }
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
  };
  const addIntervention = () => {
    const value = defaultIntervention(interventionType, interventionAge, configuration.interventions.length + 1);
    const planned: PlannedIntervention = { type: value.type, label: value.label, scheduledAgeMyr: interventionAge, magnitude: interventionMagnitude, cargo: value.cargo };
    setConfiguration((current) => ({ ...current, interventions: [...current.interventions, planned].sort((a, b) => a.scheduledAgeMyr - b.scheduledAgeMyr) }));
  };
  const setGasPartial = (gas: GasId, partialBar: number) => setConfiguration((current) => {
    const partials = Object.fromEntries(GAS_KEYS.map((key) => [key, current.params.atmosphere[key] * current.params.atmospherePressureBar])) as Record<GasId, number>;
    partials[gas] = Math.max(0, Math.min(20, partialBar || 0));
    const total = Math.max(.01, Math.min(20, GAS_KEYS.reduce((sum, key) => sum + partials[key], 0)));
    const atmosphere = Object.fromEntries(GAS_KEYS.map((key) => [key, partials[key] / total])) as Record<GasId, number>;
    return { ...current, params: normalizeParams({ ...current.params, atmospherePressureBar: total, atmosphere }) };
  });
  const setElement = (element: ElementId, value: number) => setConfiguration((current) => ({ ...current, params: normalizeParams({ ...current.params, elementBasis: { ...current.params.elementBasis, [element]: value } }) }));

  const filteredBuiltIns = SCENARIO_PRESETS.filter((item) => category === "all" || item.category === category);
  const currentUser = userPresets.find((item) => item.id === sourcePresetId);
  const selectedOrigin = ORIGIN_PRESETS[configuration.origin.theory] ?? ORIGIN_PRESETS.custom;
  const openNote = (id: string) => setOpenHelp((value) => value === id ? null : id);

  return <section className="wizard-shell" data-testid="sim-wizard" data-step={STEPS[step].id}>
    <header className="wizard-head">
      <div><span><Sparkles size={16}/> Habitat Sim / configuration studio</span><h1>Sim Wizard</h1></div>
      <div className="wizard-draft-state"><i/><span>Draft autosaved locally</span><button type="button" onClick={props.onClose} aria-label="Close Sim Wizard"><X/>Close</button></div>
    </header>
    <nav className="wizard-progress" aria-label="Simulation setup progress">{STEPS.map((item, index) => {
      const Icon = item.icon;
      return <button type="button" key={item.id} className={index === step ? "active" : index < step ? "complete" : ""} aria-current={index === step ? "step" : undefined} onClick={() => setStep(index)}><span>{index < step ? <Check/> : <Icon/>}</span><b>{String(index + 1).padStart(2, "0")}</b><em>{item.short}</em></button>;
    })}</nav>

    <div className="wizard-stage">
      <aside className="wizard-step-rail" aria-label="Wizard steps">{STEPS.map((item, index) => <button type="button" key={item.id} onClick={() => setStep(index)} className={index === step ? "active" : index < step ? "complete" : ""} aria-current={index === step ? "step" : undefined}><i>{index < step ? <Check/> : index + 1}</i><span><b>{item.label}</b><small>{index === step ? "Editing now" : index < step ? "Configured" : "Not reviewed"}</small></span></button>)}</aside>

      <main className="wizard-content" key={STEPS[step].id}>
        {step === 0 && <section className="wizard-step foundation-step">
          <PanelTitle eyebrow="Step 1 · Starting point" title="Choose a scientific foundation" aside={<Tag tone="coarse">immutable built-ins</Tag>}/>
          <p className="step-lede">Start with an uncertainty-labeled reconstruction, a mechanistic origin experiment, a boundary-pushing world, or one of your own saved configurations.</p>
          <div className="category-tabs" role="tablist" aria-label="Preset categories">{CATEGORY_LABELS.map(([id, label]) => <button type="button" role="tab" aria-selected={category === id} className={category === id ? "active" : ""} key={id} onClick={() => setCategory(id)}>{label}{id === "user" && <em>{userPresets.length}</em>}</button>)}</div>
          {category !== "user" && <div className="scenario-grid">{filteredBuiltIns.map((item) => <article className={sourcePresetId === item.id ? "scenario-card active" : "scenario-card"} key={item.id} data-model-fit={item.modelFit}>
            <header><Tag tone={item.evidence}>{evidenceLabel(item.evidence)}</Tag><span>{item.category.replaceAll("-", " ")}</span></header><h3>{item.label}</h3><b>{item.subtitle}</b><p>{item.description}</p>
            <div className="scenario-tags">{item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <footer><button type="button" className="scenario-select" onClick={() => selectBuiltIn(item.id)}>{sourcePresetId === item.id ? <Check/> : <FlaskConical/>}{sourcePresetId === item.id ? "Selected" : "Customize"}</button>{item.modelFit === "native" && <button type="button" onClick={() => props.onLaunch(scenarioConfiguration(item, configuration.seed || makeSeed()), item.id)}>Quick launch</button>}</footer>
            <details><summary>Evidence + limits <ChevronDown/></summary><p>{item.confidenceNote}</p>{item.caveats.map((caveat) => <small key={caveat}>{caveat}</small>)}<nav>{item.sourceIds.map((id) => SCIENCE_SOURCES[id] && <a key={id} href={SCIENCE_SOURCES[id].url} target="_blank" rel="noreferrer">{SCIENCE_SOURCES[id].attribution} ({SCIENCE_SOURCES[id].year})</a>)}</nav></details>
          </article>)}</div>}
          {category === "user" && <div className="user-preset-library">
            <div className="preset-library-head"><div><h3>Your reusable world presets</h3><p>These store setup definitions. Running-state saves remain separate simulation snapshots.</p></div><label className="file-button"><Upload/>Import preset<input aria-label="Import preset" type="file" accept="application/json,.json" onChange={(event) => props.onImportPreset(event.target.files?.[0])}/></label></div>
            {!userPresets.length && <div className="empty-library"><FlaskConical/><h3>No custom presets yet</h3><p>Customize any built-in, then save it from Review. Your draft is already safe.</p><button type="button" onClick={() => setCategory("earth-history")}>Explore Earth analogues</button></div>}
            <div className="user-preset-grid">{userPresets.map((preset) => <article className={sourcePresetId === preset.id ? "active" : ""} key={preset.id}><header><Tag tone={preset.evidence}>user preset</Tag><small>{new Date(preset.updatedAt).toLocaleDateString()}</small></header><h3>{preset.name}</h3><p>{preset.description || `Modified from ${preset.basePresetId || "a blank configuration"}.`}</p><footer><button type="button" onClick={() => selectUser(preset)}>Open</button><button type="button" aria-label={`Duplicate ${preset.name}`} onClick={() => props.onDuplicatePreset(preset)}><Copy/></button><button type="button" aria-label={`Export ${preset.name}`} onClick={() => props.onExportPreset(preset)}><Download/></button><button className="danger" type="button" aria-label={`Delete ${preset.name}`} onClick={() => setDeleteCandidate(preset)}><Trash2/></button></footer></article>)}</div>
            {deleteCandidate && <div className="inline-confirm" role="alertdialog" aria-label="Confirm preset deletion"><AlertTriangle/><span><b>Delete “{deleteCandidate.name}”?</b><small>The built-in it came from remains available.</small></span><button type="button" onClick={() => setDeleteCandidate(null)}>Keep</button><button className="danger" type="button" onClick={() => { props.onDeletePreset(deleteCandidate); setLastDeleted(deleteCandidate); setDeleteCandidate(null); }}>Delete</button></div>}
            {lastDeleted && <div className="undo-banner" role="status"><span>“{lastDeleted.name}” deleted.</span><button type="button" onClick={() => { props.onRestorePreset(lastDeleted); setLastDeleted(null); }}>Undo</button></div>}
          </div>}
        </section>}

        {step === 1 && <section className="wizard-step system-step">
          <PanelTitle eyebrow="Step 2 · Stellar architecture" title="Build the energy source" aside={<button className="disclosure" type="button" onClick={() => setAdvanced((value) => !value)}>{advanced ? "Hide" : "Show"} advanced</button>}/>
          <p className="step-lede">Configure bolometric forcing and the high-energy environment. Multiple-star settings are openly constrained as aggregate forcing proxies.</p>
          {!!errors.length && <div className="validation-summary" ref={errorRef} tabIndex={-1}><AlertTriangle/><span><b>Review before continuing</b>{errors.map((error) => <small key={error}>{error}</small>)}</span></div>}
          <div className="architecture-switch" role="radiogroup" aria-label="Stellar architecture">{([1,2,3] as const).map((count) => <button type="button" role="radio" aria-checked={configuration.params.starCount === count} className={configuration.params.starCount === count ? "active" : ""} onClick={() => updateParam("starCount", count)} key={count}><span>{Array.from({length:count},(_,i)=><i key={i}/>)}</span><b>{count === 1 ? "Single star" : count === 2 ? "Circumbinary proxy" : "Hierarchical triple"}</b><small>{count === 1 ? "Native stellar forcing" : count === 2 ? "One representative companion" : "Two matched companion proxies"}</small></button>)}</div>
          <div className="wizard-control-grid">{fieldSet("system", configuration, advanced).filter((field) => field.key !== "starCount").map((field) => <ParameterControl key={field.key} field={field} configuration={configuration} onChange={updateParam} onFocus={setActiveField} helpOpen={openHelp === field.key} onToggleHelp={() => openNote(field.key)}/>)}</div>
          {preview && <div className="live-instrument"><header><span><i/> live coupled preview</span><b>{preview.observables.stellarArchitecture.replaceAll("-", " ")}</b></header><div><span>Mean flux<b>{preview.habitableZoneFlux.toFixed(2)} S⊕</b></span><span>Flux range<b>{preview.observables.apoapsisFlux.toFixed(2)}–{preview.observables.periapsisFlux.toFixed(2)}</b></span><span>Companion share<b>{(preview.observables.companionFluxFraction*100).toFixed(1)}%</b></span><span>Stability proxy<b>{(preview.observables.climateStabilityIndex*100).toFixed(0)} / 100</b></span></div><small>Habitable-zone context assumes surface liquid water and a globally averaged climate. It is not a habitability verdict.</small></div>}
        </section>}

        {step === 2 && <section className="wizard-step world-step">
          <PanelTitle eyebrow="Step 3 · Bulk world + deep engine" title="Shape the planet" aside={<button className="disclosure" type="button" onClick={() => setAdvanced((value) => !value)}>{advanced ? "Hide" : "Show"} advanced</button>}/>
          <p className="step-lede">Mass, radius, spin, accessible elements, and retained heat determine the physical arena before biology enters it.</p>
          <div className="world-dashboard">{preview ? <><div className="world-orb"><Globe2/><i/><span>ρ {preview.observables.bulkDensityGcm3.toFixed(2)}</span></div><div><span>Gravity<strong>{preview.observables.gravityEarth.toFixed(2)} g</strong></span><span>Escape<strong>{preview.observables.escapeVelocityKmS.toFixed(1)} km/s</strong></span><span>Interior<strong>{(preview.observables.internalHeatFluxIndex*100).toFixed(0)}</strong></span><span>Regime<strong>{preview.observables.tectonicRegime}</strong></span></div></> : <p>Preview temporarily unavailable; your draft remains intact.</p>}</div>
          <div className="wizard-control-grid">{fieldSet("world", configuration, advanced).map((field) => <ParameterControl key={field.key} field={field} configuration={configuration} onChange={updateParam} onFocus={setActiveField} helpOpen={openHelp === field.key} onToggleHelp={() => openNote(field.key)}/>)}{fieldSet("interior", configuration, advanced).map((field) => <ParameterControl key={field.key} field={field} configuration={configuration} onChange={updateParam} onFocus={setActiveField} helpOpen={openHelp === field.key} onToggleHelp={() => openNote(field.key)}/>)}</div>
          <PanelTitle eyebrow="Accessible reservoirs" title="Element basis" aside={<Tag tone="speculative">bioavailability indices</Tag>}/>
          <div className="element-editor">{ELEMENT_KEYS.map((element) => {const note=elementGuidance(element,configuration);return <label key={element}><span><b>{element}</b><span><strong>{Math.round(configuration.params.elementBasis[element]*100)}</strong><ScienceHelp item={note} open={openHelp===note.id} onToggle={()=>openNote(note.id)}/></span></span><input aria-label={`${element} availability`} type="range" min="0" max="1" step=".01" value={configuration.params.elementBasis[element]} onFocus={() => setActiveField("originDifficulty")} onChange={(event) => setElement(element, Number(event.target.value))}/></label>})}</div>
          <p className="model-boundary"><AlertTriangle/>Element controls represent accessible reservoirs, not bulk mineralogy. Every evolved lineage still uses carbon–water analogue rules.</p>
        </section>}

        {step === 3 && <section className="wizard-step surface-step">
          <PanelTitle eyebrow="Step 4 · Atmosphere + surface" title="Create the reaction environment" aside={<Tag tone="coarse">partial-pressure editor</Tag>}/>
          <p className="step-lede">Set climate controls and gas inventories. Editing one partial pressure preserves the others and recalculates total pressure explicitly.</p>
          <div className="wizard-control-grid">{fieldSet("surface", configuration, advanced).map((field) => <ParameterControl key={field.key} field={field} configuration={configuration} onChange={updateParam} onFocus={setActiveField} helpOpen={openHelp === field.key} onToggleHelp={() => openNote(field.key)}/>)}</div>
          <div className="atmosphere-console"><header><div><span>Total column</span><strong>{configuration.params.atmospherePressureBar.toFixed(3)} bar</strong></div><div><span>Climate preview</span><strong>{preview?.observables.climateRegime.replaceAll("-", " ") || "unavailable"}</strong></div></header><div className="partial-grid">{GAS_KEYS.map((gas) => {const partial = configuration.params.atmosphere[gas]*configuration.params.atmospherePressureBar;const note=gasGuidance(gas,configuration);return <label key={gas}><span><b>{gas.toUpperCase()}</b><span><small>{(configuration.params.atmosphere[gas]*100).toFixed(2)}%</small><ScienceHelp item={note} open={openHelp===note.id} onToggle={()=>openNote(note.id)}/></span></span><input aria-label={`${gas.toUpperCase()} partial pressure`} type="number" min="0" max="20" step=".0001" value={partial.toFixed(4)} onChange={(event) => setGasPartial(gas, Number(event.target.value))}/><em>bar partial</em></label>})}</div></div>
          {preview && <div className="surface-readout"><span>Temperature<b>{preview.state.surface.temperatureC.toFixed(1)}°C</b></span><span>Liquid solvent<b>{(preview.state.surface.liquidWater*100).toFixed(0)}</b></span><span>Retention<b>{(preview.observables.atmosphericRetentionIndex*100).toFixed(0)}</b></span><span>Runaway risk<b>{(preview.observables.runawayGreenhouseRisk*100).toFixed(0)}</b></span><span>Abiotic O₂ risk<b>{(preview.observables.abioticOxygenRisk*100).toFixed(0)}</b></span></div>}
        </section>}

        {step === 4 && <section className="wizard-step origin-step">
          <PanelTitle eyebrow="Step 5 · Origin chemistry" title="Choose a mechanistic hypothesis" aside={<Tag tone={selectedOrigin.evidence}>{selectedOrigin.evidence}</Tag>}/>
          <p className="step-lede">These are laboratory-supported components and literature-inspired environments—not established explanations for life's origin. Ingredient delivery and panspermia are planned later as overlays.</p>
          <div className="origin-card-grid">{Object.values(ORIGIN_PRESETS).filter((item) => !["exogenous","lithopanspermia","custom"].includes(item.theory)).map((item) => <button type="button" key={item.theory} className={configuration.origin.theory === item.theory ? "active" : ""} onClick={() => updateOrigin(item)}><span><Atom/><Tag tone={item.evidence}>{item.evidence}</Tag></span><b>{item.label}</b><p>{item.description}</p></button>)}</div>
          <div className="origin-tuning"><PanelTitle eyebrow="Composable protocol" title="Tune the reaction context"/>{(["energy","catalysts","wetDryCycling","ventFlux","exogenousDose","recurrence","survivalFraction"] as Array<keyof OriginConfig>).map((key) => {if(typeof configuration.origin[key]!=="number")return null;const note=originControlGuidance(key,configuration);return <label className="wizard-range" key={key}><span><b>{key.replaceAll(/([A-Z])/g," $1")}</b><span><strong>{Math.round(Number(configuration.origin[key])*100)}</strong><ScienceHelp item={note} open={openHelp===note.id} onToggle={()=>openNote(note.id)}/></span></span><input aria-label={key.replaceAll(/([A-Z])/g," $1")} type="range" min="0" max="1" step=".01" value={Number(configuration.origin[key])} onChange={(event) => updateOrigin({ [key]: Number(event.target.value) })}/></label>})}</div>
          {preview && <div className="gate-preview"><header><span>Six origin gates</span><strong>Limiting: {preview.originDiagnostics.limitingGate.label}</strong></header>{preview.originDiagnostics.gates.map((gate) => <div className={gate.id === preview.originDiagnostics.limitingGate.id ? "limiting" : ""} key={gate.id}><span>{gate.label}</span><i><b style={{width:`${Math.max(2,gate.score*100)}%`}}/></i><strong>{Math.round(gate.score*100)}</strong></div>)}<small>The opportunity rate is an internal experiment comparator, never an empirical probability of life.</small></div>}
        </section>}

        {step === 5 && <section className="wizard-step evolution-step">
          <PanelTitle eyebrow="Step 6 · Evolution + intervention plan" title="Stage a reproducible history" aside={<Tag tone="speculative">deterministic seed</Tag>}/>
          <p className="step-lede">Define variation pressure and an exact timeline of delivery, stellar, geological, or explicitly speculative biological events.</p>
          <div className="seed-horizon"><label><span>Deterministic seed</span><div><input aria-label="Deterministic seed" value={configuration.seed} onChange={(event) => setConfiguration((current) => ({...current, seed:event.target.value, params:{...current.params,seed:event.target.value}}))}/><button type="button" onClick={() => {const seed=makeSeed();setConfiguration((current)=>({...current,seed,params:{...current.params,seed}}))}}>Randomize</button></div></label><label><span>Review horizon</span><div><input aria-label="Review horizon" type="number" min="1" max="20000" step="100" value={configuration.runHorizonMyr} onChange={(event) => setConfiguration((current)=>({...current,runHorizonMyr:Number(event.target.value)}))}/><b>Myr</b></div></label></div>
          <div className="wizard-control-grid">{fieldSet("evolution", configuration, advanced).map((field) => <ParameterControl key={field.key} field={field} configuration={configuration} onChange={updateParam} onFocus={setActiveField} helpOpen={openHelp === field.key} onToggleHelp={() => openNote(field.key)}/>)}</div>
          <div className="intervention-planner"><PanelTitle eyebrow="Deterministic event queue" title="Mid-simulation interventions"/><div className="event-composer"><label><span>Event</span><select aria-label="Planned intervention" value={interventionType} onChange={(event)=>setInterventionType(event.target.value as InterventionType)}>{INTERVENTIONS.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label><label><span>At age</span><input aria-label="Intervention age" type="number" min="0" max="20000" step="10" value={interventionAge} onChange={(event)=>setInterventionAge(Number(event.target.value))}/><small>Myr</small></label><label><span>Magnitude</span><input aria-label="Intervention magnitude" type="range" min=".01" max="1" step=".01" value={interventionMagnitude} onChange={(event)=>setInterventionMagnitude(Number(event.target.value))}/><small>{Math.round(interventionMagnitude*100)}%</small></label><button type="button" onClick={addIntervention}><Plus/>Add to timeline</button></div>
            <div className="planned-events">{configuration.interventions.map((item,index)=><article key={`${item.type}-${item.scheduledAgeMyr}-${index}`}><i>{String(index+1).padStart(2,"0")}</i><span><b>{item.label}</b><small>{item.scheduledAgeMyr.toLocaleString()} Myr · {Math.round(item.magnitude*100)}% · {Object.keys(item.cargo).join(", ") || "no material cargo"}</small></span><Tag tone={item.type.includes("seed")||item.type.includes("spores")?"speculative":"coarse"}>{item.type.includes("seed")||item.type.includes("spores")?"speculative":"modeled"}</Tag><button type="button" aria-label={`Remove ${item.label}`} onClick={()=>setConfiguration((current)=>({...current,interventions:current.interventions.filter((_,i)=>i!==index)}))}><Trash2/></button></article>)}{!configuration.interventions.length&&<div className="empty-events"><Orbit/><span><b>No staged events</b><small>The planet will evolve under background forcing alone.</small></span></div>}</div>
          </div>
        </section>}

        {step === 6 && <section className="wizard-step review-step">
          <PanelTitle eyebrow="Step 7 · Scientific review" title="Trace the causal experiment" aside={<Tag tone={errors.length||outsideModel&&!acknowledgedBoundary?"warn":"good"}>{errors.length?`${errors.length} blockers`:outsideModel&&!acknowledgedBoundary?"acknowledge limit":"ready to launch"}</Tag>}/>
          <p className="step-lede">Launching is the only action that replaces the active simulation. Save this setup first if you want a reusable version.</p>
          <div className="causal-review"><article><Orbit/><span><small>System</small><b>{configuration.params.starCount} star{configuration.params.starCount===1?"":"s"} · {preview?.habitableZoneFlux.toFixed(2)} S⊕</b></span></article><ArrowRight/><article><Globe2/><span><small>Climate</small><b>{preview?.observables.climateRegime.replaceAll("-"," ") || "unavailable"}</b></span></article><ArrowRight/><article><Atom/><span><small>Origin</small><b>{configuration.origin.theory.replaceAll("-"," ")}</b></span></article><ArrowRight/><article><Activity/><span><small>History</small><b>{configuration.interventions.length} planned events</b></span></article></div>
          <div className="review-grid"><section><PanelTitle eyebrow="Configuration ledger" title={presetName}/><dl><div><dt>Source</dt><dd>{sourceScenario?.label||userSource?.name||"Custom draft"}</dd></div><div><dt>Seed</dt><dd>{configuration.seed}</dd></div><div><dt>Architecture</dt><dd>{configuration.params.starTopology.replaceAll("-"," ")}</dd></div><div><dt>Planet</dt><dd>{configuration.params.planetMassEarth.toFixed(2)} M⊕ / {configuration.params.planetRadiusEarth.toFixed(2)} R⊕</dd></div><div><dt>Atmosphere</dt><dd>{configuration.params.atmospherePressureBar.toFixed(2)} bar</dd></div><div><dt>Origin barrier</dt><dd>{Math.round(configuration.params.originDifficulty*100)} model index</dd></div></dl>{sourceScenario&&<details className="source-drawer" open><summary>Preset provenance <BookOpen/></summary><p>{sourceScenario.confidenceNote}</p>{sourceScenario.caveats.map(item=><small key={item}>{item}</small>)}{sourceScenario.sourceIds.map(id=>SCIENCE_SOURCES[id]&&<a key={id} href={SCIENCE_SOURCES[id].url} target="_blank" rel="noreferrer">{SCIENCE_SOURCES[id].title} — {SCIENCE_SOURCES[id].attribution}</a>)}</details>}</section><section><PanelTitle eyebrow="Caveat register" title="What could change the outcome"/>{errors.length>0&&<div className="review-blockers">{errors.map(error=><article key={error}><AlertTriangle/><span><b>Launch blocker</b><small>{error}</small></span></article>)}</div>}<div className="review-signals">{guidance.map(item=><article className={`signal-${item.tone}`} key={item.id}><i/><span><b>{item.title}</b><small>{item.summary}</small></span><Tag tone={item.evidence}>{item.evidence}</Tag></article>)}</div>{!guidance.length&&<div className="review-clear"><Check/><span><b>No elevated coupled warnings</b><small>Ordinary scientific uncertainty and documented model limits still apply.</small></span></div>}</section></div>
          {outsideModel&&<label className="boundary-ack"><input type="checkbox" checked={acknowledgedBoundary} onChange={(event)=>setAcknowledgedBoundary(event.target.checked)}/><span><b>I understand this scenario is outside the aqueous carbon-model validity boundary.</b><small>Climate and inventory results may be inspected, but origin scores and lineage evolution are not scientifically interpretable for methane-solvent life.</small></span></label>}
          <div className="save-preset"><span><Save/><span><b>Reusable setup preset</b><small>Separate from a running simulation snapshot</small></span></span><input aria-label="Preset name" value={presetName} maxLength={80} onChange={(event)=>setPresetName(event.target.value)}/><button type="button" onClick={()=>props.onSavePreset(configuration,presetName,sourcePresetId,currentUser)}> {currentUser?"Update my preset":"Save as new preset"}</button>{currentUser&&<button type="button" onClick={()=>props.onSavePreset(configuration,`${presetName} copy`,sourcePresetId)}>Save as copy</button>}</div>
          <button className="launch-button" type="button" disabled={errors.length>0||(outsideModel&&!acknowledgedBoundary)} onClick={()=>props.onLaunch(configuration,sourcePresetId)}><Rocket/><span><b>Launch deterministic simulation</b><small>Replace the active world with this reviewed configuration</small></span><ArrowRight/></button>
        </section>}
      </main>
      {step > 0 && step < 6 && <ImpactLens guidance={guidance} focused={focusedGuidance}/>}
    </div>
    <footer className="wizard-footer"><button type="button" onClick={() => step === 0 ? props.onClose() : setStep((value)=>Math.max(0,value-1))}><ArrowLeft/>{step===0?"Close":"Back"}</button><span><b>{step+1} / {STEPS.length}</b><small>{sourceScenario?.label||userSource?.name||"Custom draft"}</small></span>{step<STEPS.length-1?<button className="primary" type="button" onClick={goNext}>Continue to {STEPS[step+1].short}<ArrowRight/></button>:<button className="primary" type="button" disabled={errors.length>0||(outsideModel&&!acknowledgedBoundary)} onClick={()=>props.onLaunch(configuration,sourcePresetId)}>Launch<Rocket/></button>}</footer>
  </section>;
}

export function makeInitialWizardDraft(configuration: ScenarioConfiguration, sourcePresetId = "late-hadean-shore"): WizardDraft {
  return { schemaVersion: 1, sourcePresetId, selectedCategory: "earth-history", configuration: structuredClone(configuration), dirty: false, updatedAt: new Date().toISOString() };
}
