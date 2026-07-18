import { useEffect, useMemo, useState } from "react";
import { Activity, CircleStop, Download, Save, Sparkles, Upload, WandSparkles } from "lucide-react";
import { DEFAULT_ELEMENTS, DEFAULT_PARAMS } from "../../simulation/constants";
import { HabitatSimulation } from "../../simulation/engine";
import { defaultIntervention } from "../../simulation/interventions";
import { PARAMETER_FIELDS, type NumericPlanetKey } from "../../simulation/parameters";
import { normalizeParams } from "../../simulation/planet";
import { getScenario, SCENARIO_PRESETS, scenarioConfiguration } from "../../simulation/presets";
import { makeSeed } from "../../simulation/random";
import type { ElementId, GasId, InterventionType, OriginConfig, PlanetParams, SimulationSummary } from "../../simulation/types";
import { PanelTitle, Tag } from "../../components/Primitives";

export type SavedExperiment = { id: string; title: string; savedAt: string; payload: string };

const GROUPS: Array<{ id: string; label: string; description: string; group: "system" | "world" | "interior" | "surface" | "evolution" }> = [
  { id: "system", label: "Star system and orbit", description: "Spectrum, architecture, energy, and seasonal forcing", group: "system" },
  { id: "world", label: "Bulk world", description: "Mass, radius, spin, and axial geometry", group: "world" },
  { id: "interior", label: "Deep engine", description: "Differentiation, retained heat, and recycling", group: "interior" },
  { id: "surface", label: "Surface controls", description: "Reflectivity, water, land, and pressure", group: "surface" },
  { id: "evolution", label: "Evolution experiment", description: "Impacts, variation, and origin barrier", group: "evolution" }
];
const GAS_KEYS: GasId[] = ["n2", "co2", "h2o", "ch4", "o2", "h2", "nh3", "so2"];
const ELEMENT_KEYS: ElementId[] = ["carbon", "hydrogen", "nitrogen", "oxygen", "phosphorus", "sulfur", "iron"];
const INTERVENTION_OPTIONS: Array<[InterventionType, string]> = [
  ["organic-asteroid", "Carbonaceous asteroid"], ["ice-comet", "Ice-rich comet"], ["nutrient-deposition", "Nutrient deposition"],
  ["volcanic-pulse", "Volcanic pulse"], ["stellar-flare", "Stellar flare"], ["quiet-star", "Quiet-star interval"],
  ["microbial-seed", "Speculative microbial seed"], ["fungal-spores", "Speculative fungal spores"], ["sterilizing-impact", "Sterilizing impact"],
  ["custom", "Custom material cargo"]
];

export function LabView({ summary, library, customPresetCount, onOpenWizard, onReset, onIntervene, onSave, onLoad, onDelete, onExport, onImport }: {
  summary: SimulationSummary;
  library: SavedExperiment[];
  customPresetCount: number;
  onOpenWizard: () => void;
  onReset: (seed: string, params: Partial<PlanetParams>, origin?: Partial<OriginConfig>) => void;
  onIntervene: (intervention: ReturnType<typeof defaultIntervention>) => void;
  onSave: () => void;
  onLoad: (record: SavedExperiment) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file?: File) => void;
}) {
  const [seed, setSeed] = useState(summary.seed);
  const [params, setParams] = useState<PlanetParams>(() => structuredClone(summary.state.params));
  const [preset, setPreset] = useState("late-hadean-shore");
  const [interventionType, setInterventionType] = useState<InterventionType>("organic-asteroid");
  const [magnitude, setMagnitude] = useState(.65);
  const [delay, setDelay] = useState(0);
  const [cargo, setCargo] = useState({ water: 0, organics: .4, aminoAcids: .2, nucleotides: .1, carbon: .2, phosphorus: .1, iron: .1 });

  useEffect(() => { setSeed(summary.seed); setParams(structuredClone(summary.state.params)); }, [summary.seed]);
  const selectedScenario = getScenario(preset);
  const preview = useMemo(() => new HabitatSimulation(seed || "preview-world", params, selectedScenario.origin).getSummary(), [params, seed, selectedScenario]);
  const changedFields = PARAMETER_FIELDS.filter((field) => Math.abs(Number(params[field.key]) - Number(DEFAULT_PARAMS[field.key])) > field.step / 2).length;

  const applyPreset = (id: string) => {
    const selected = getScenario(id);
    const next = scenarioConfiguration(selected, seed || makeSeed());
    setPreset(id); setSeed(next.seed); setParams(next.params);
  };
  const updateParam = (key: NumericPlanetKey, value: number) => setParams((current) => {
    const next = normalizeParams({ ...current, [key]: value });
    if (key === "starCount") next.starTopology = value === 1 ? "single" : value === 2 ? "circumbinary" : "hierarchical-triple";
    return next;
  });
  const setGasPartial = (gas: GasId, partialBar: number) => setParams((current) => {
    const partials = Object.fromEntries(GAS_KEYS.map((key) => [key, current.atmosphere[key] * current.atmospherePressureBar])) as Record<GasId, number>;
    partials[gas] = Math.max(0, partialBar || 0);
    const total = Math.max(.01, Math.min(20, GAS_KEYS.reduce((sum, key) => sum + partials[key], 0)));
    return normalizeParams({ ...current, atmospherePressureBar: total, atmosphere: Object.fromEntries(GAS_KEYS.map((key) => [key, partials[key] / total])) as Record<GasId, number> });
  });

  return <section className="lab-layout" data-testid="lab-view">
    <div className="lab-column">
      <div className="wizard-launcher"><span><i><WandSparkles/></i><span><small>Guided configuration studio</small><strong>Build a scientifically reviewed world</strong><p>Seven focused steps, adaptive causal guidance, research-linked presets, custom preset saving, and intervention planning.</p></span></span><button className="primary" onClick={onOpenWizard}><Sparkles/>Launch Sim Wizard</button><footer><span>{SCENARIO_PRESETS.length} built-ins</span><span>{customPresetCount} custom</span><span>draft autosave</span></footer></div>
      <PanelTitle eyebrow="Expert quick editor" title="Planet and star" aside={<Tag tone="coarse">reset required</Tag>}/>
      <div className="field-row"><label><span>Seed</span><input value={seed} onChange={(event) => setSeed(event.target.value)}/></label><button onClick={() => setSeed(makeSeed())}>Randomize</button></div>
      <label className="select-field"><span>Research scenario</span><select value={preset} onChange={(event) => applyPreset(event.target.value)}>{["earth-history","plausible","experimental"].map((category) => <optgroup label={category.replaceAll("-"," ")} key={category}>{SCENARIO_PRESETS.filter((item) => item.category === category).map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</optgroup>)}</select><small>{selectedScenario.description}</small></label>
      <div className="lab-preview" aria-label="Initial condition preview"><span><i/> live initial-state preview</span><strong>{preview.observables.climateRegime.replaceAll("-", " ")}</strong><small>{preview.state.surface.temperatureC.toFixed(1)}°C · {preview.habitableZoneFlux.toFixed(2)} S⊕ · {preview.observables.tectonicRegime} · {changedFields} changed controls</small></div>
      <div className="parameter-sections">{GROUPS.map((group, index) => {const fields = PARAMETER_FIELDS.filter((field) => field.group === group.group && (!field.companionOnly || params.starCount > 1));return <details key={group.id} open={index < 2}><summary><span><strong>{group.label}</strong><small>{group.description}</small></span><em>{fields.filter((field) => Math.abs(Number(params[field.key])-Number(DEFAULT_PARAMS[field.key]))>field.step/2).length} changed</em></summary><div className="parameter-grid">{fields.map((field)=><label className="range-field" key={field.key}><span>{field.label}<strong>{Number(params[field.key]).toFixed(field.step<.01?3:field.step<.1?2:0)} {field.unit}</strong></span><input aria-label={field.label} type="range" min={field.min} max={field.max} step={field.step} value={Number(params[field.key])} onChange={(event)=>updateParam(field.key,Number(event.target.value))}/><small>{field.description}</small></label>)}</div></details>})}</div>
      <PanelTitle eyebrow="Initial atmosphere" title="Gas partial pressures"/>
      <div className="gas-grid">{GAS_KEYS.map((gas)=><label key={gas}><span>{gas.toUpperCase()} · {(params.atmosphere[gas]*100).toFixed(1)}%</span><input aria-label={`${gas.toUpperCase()} partial pressure`} type="number" min="0" max="20" step="0.0001" value={(params.atmosphere[gas]*params.atmospherePressureBar).toFixed(4)} onChange={(event)=>setGasPartial(gas,Number(event.target.value))}/></label>)}</div>
      <PanelTitle eyebrow="Accessible reservoirs" title="Element basis"/>
      <div className="element-editor compact">{ELEMENT_KEYS.map((element)=><label key={element}><span><b>{element}</b><strong>{Math.round(params.elementBasis[element]*100)}</strong></span><input aria-label={`${element} availability`} type="range" min="0" max="1" step=".01" value={params.elementBasis[element]??DEFAULT_ELEMENTS[element]} onChange={(event)=>setParams((current)=>normalizeParams({...current,elementBasis:{...current.elementBasis,[element]:Number(event.target.value)}}))}/></label>)}</div>
      <button className="primary wide" onClick={() => onReset(seed, params, selectedScenario.origin)}><Activity/>Generate planet from quick editor</button>
    </div>

    <div className="lab-column">
      <PanelTitle eyebrow="Event composer" title="Intervene during history" aside={<Tag tone={interventionType.includes("seed")||interventionType.includes("spores")?"speculative":"coarse"}>{interventionType.includes("seed")||interventionType.includes("spores")?"speculative":"coarse"}</Tag>}/>
      <label className="select-field"><span>Intervention</span><select value={interventionType} onChange={(event)=>setInterventionType(event.target.value as InterventionType)}>{INTERVENTION_OPTIONS.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
      <label className="range-field"><span>Magnitude<strong>{Math.round(magnitude*100)}%</strong></span><input type="range" min=".05" max="1" step=".01" value={magnitude} onChange={(event)=>setMagnitude(Number(event.target.value))}/></label>
      <label className="range-field"><span>Delay from current age<strong>{delay.toFixed(0)} Myr</strong></span><input type="range" min="0" max="1000" step="10" value={delay} onChange={(event)=>setDelay(Number(event.target.value))}/></label>
      {interventionType==="custom"&&<div className="cargo-grid">{Object.entries(cargo).map(([key,value])=><label key={key}><span>{key.replaceAll(/([A-Z])/g," $1")}</span><input aria-label={`Cargo ${key}`} type="number" min="0" max="1" step=".05" value={value} onChange={(event)=>setCargo((current)=>({...current,[key]:Math.max(0,Math.min(1,Number(event.target.value)||0))}))}/></label>)}</div>}
      <button className="accent-button wide" onClick={()=>{const intervention=defaultIntervention(interventionType,summary.ageMyr+delay,summary.state.interventions.length+1);intervention.magnitude=magnitude;if(interventionType==="custom")intervention.cargo=cargo;onIntervene(intervention)}}><Sparkles/>{delay?"Schedule intervention":"Apply intervention now"}</button>
      <p className="model-note">Biological cargo faces survival gates. Fungal spores require an oxygenated, wet, food-bearing biosphere; their arrival is explicitly speculative.</p>
      <PanelTitle eyebrow="Simulation snapshots" title="Running-state records" aside={<Tag tone="grounded">separate from presets</Tag>}/>
      <p className="model-note">Snapshots include evolved state and history. Reusable starting configurations belong in the Sim Wizard preset library.</p>
      <div className="library-actions"><button onClick={onSave}><Save/>Save snapshot</button><button onClick={onExport}><Download/>Export</button><label className="file-button"><Upload/>Import<input type="file" accept="application/json,.json" onChange={(event)=>onImport(event.target.files?.[0])}/></label></div>
      <div className="saved-list">{library.map((record)=><article key={record.id}><span><strong>{record.title}</strong><small>{new Date(record.savedAt).toLocaleString()}</small></span><div><button onClick={()=>onLoad(record)}>Load</button><button className="danger" onClick={()=>onDelete(record.id)}><CircleStop/>Delete</button></div></article>)}{!library.length&&<p className="model-note">No simulation snapshots. Data remains in this browser unless exported.</p>}</div>
    </div>
  </section>;
}
