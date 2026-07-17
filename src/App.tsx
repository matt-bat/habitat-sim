import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, Atom, BookOpen, ChevronRight, CircleStop, Dna, Download, FlaskConical, Gauge, GitBranch,
  Home, Leaf, Pause, Play, RotateCcw, Save, Sparkles, StepForward, Upload
} from "lucide-react";
import { DEFAULT_ORIGIN, DEFAULT_PARAMS, PLANET_PRESETS } from "./simulation/constants";
import { HabitatSimulation } from "./simulation/engine";
import { defaultIntervention } from "./simulation/interventions";
import { normalizeParams } from "./simulation/planet";
import { makeSeed } from "./simulation/random";
import type { GasId, InterventionType, Lineage, OriginConfig, PlanetParams, SimulationSummary, TimelineEvent } from "./simulation/types";
import { BiosphereView, LineagesView, OriginsView, PlanetView, TimelineView } from "./components/Views";
import { Metric, PanelTitle, Tag, formatAge } from "./components/Primitives";

type ViewId = "planet" | "origins" | "biosphere" | "lineages" | "timeline" | "lab";
type SavedExperiment = { id: string; title: string; savedAt: string; payload: string };

const STORAGE_KEY = "habitat-sim.experiments.v1";
const MAX_IMPORT_BYTES = 1_500_000;
const SPEEDS = [
  { label: "0.5 Myr/s", rate: 0.5 },
  { label: "5 Myr/s", rate: 5 },
  { label: "25 Myr/s", rate: 25 },
  { label: "100 Myr/s", rate: 100 },
  { label: "500 Myr/s", rate: 500 }
];

const NAV_ITEMS: Array<{ id: ViewId; label: string; icon: typeof Home }> = [
  { id: "planet", label: "Planet", icon: Home },
  { id: "origins", label: "Origins", icon: Atom },
  { id: "biosphere", label: "Biosphere", icon: Leaf },
  { id: "lineages", label: "Lineages", icon: GitBranch },
  { id: "timeline", label: "Timeline", icon: BookOpen },
  { id: "lab", label: "Lab", icon: FlaskConical }
];

const PARAM_FIELDS: Array<{ key: keyof PlanetParams; label: string; min: number; max: number; step: number; unit?: string }> = [
  { key: "starLuminositySolar", label: "Stellar luminosity", min: .003, max: 3, step: .01, unit: "L⊙" },
  { key: "starActivity", label: "Stellar activity", min: 0, max: 1, step: .01 },
  { key: "orbitalDistanceAu", label: "Orbital distance", min: .03, max: 3, step: .01, unit: "AU" },
  { key: "planetMassEarth", label: "Planet mass", min: .2, max: 5, step: .05, unit: "M⊕" },
  { key: "planetRadiusEarth", label: "Planet radius", min: .5, max: 2, step: .02, unit: "R⊕" },
  { key: "albedo", label: "Albedo", min: .05, max: .75, step: .01 },
  { key: "waterInventory", label: "Water inventory", min: 0, max: 1.5, step: .01 },
  { key: "landFraction", label: "Land fraction", min: 0, max: .95, step: .01 },
  { key: "coreFraction", label: "Core fraction", min: .05, max: .7, step: .01 },
  { key: "initialHeat", label: "Initial heat", min: 0, max: 1, step: .01 },
  { key: "radionuclides", label: "Radiogenic heat", min: 0, max: 1, step: .01 },
  { key: "tectonicMobility", label: "Tectonic mobility", min: 0, max: 1, step: .01 },
  { key: "mutationRate", label: "Mutation pressure", min: .02, max: 1, step: .01 },
  { key: "originDifficulty", label: "Origin difficulty", min: .05, max: 1, step: .01 }
];

const GAS_KEYS: GasId[] = ["n2", "co2", "h2o", "ch4", "o2", "h2", "nh3", "so2"];

function loadLibrary(): SavedExperiment[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.payload === "string").slice(0, 12) : [];
  } catch { return []; }
}

export function App() {
  const initialSeed = useRef(makeSeed());
  const simulationRef = useRef(new HabitatSimulation(initialSeed.current, { ...DEFAULT_PARAMS, seed: initialSeed.current }, DEFAULT_ORIGIN));
  const [summary, setSummary] = useState<SimulationSummary>(() => simulationRef.current.getSummary());
  const [view, setView] = useState<ViewId>("planet");
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(2);
  const [selectedLineage, setSelectedLineage] = useState<Lineage | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [quickIntervention, setQuickIntervention] = useState<InterventionType>("organic-asteroid");
  const [toast, setToast] = useState("");
  const [library, setLibrary] = useState<SavedExperiment[]>(loadLibrary);

  const refresh = useCallback(() => setSummary(simulationRef.current.getSummary()), []);
  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous = performance.now();
    let lastPaint = previous;
    const tick = (now: number) => {
      const elapsed = Math.min(.1, (now - previous) / 1000);
      previous = now;
      simulationRef.current.step(SPEEDS[speedIndex].rate * elapsed);
      if (now - lastPaint > 180) {
        refresh();
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speedIndex, refresh]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(library)); }
    catch { notify("Local storage is unavailable; export important experiments."); }
  }, [library, notify]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.code === "Space") { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key === "ArrowRight") setSpeedIndex((value) => Math.min(SPEEDS.length - 1, value + 1));
      if (event.key === "ArrowLeft") setSpeedIndex((value) => Math.max(0, value - 1));
      if (event.key.toLowerCase() === "h") setView("planet");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const updateOrigin = (origin: Partial<OriginConfig>) => {
    simulationRef.current.setOrigin(origin);
    refresh();
  };

  const applyQuickIntervention = () => {
    simulationRef.current.interveneNow(quickIntervention);
    refresh();
    setSelectedEvent(simulationRef.current.getSummary().state.timeline[0] || null);
    notify("Intervention applied and recorded.");
  };

  const resetExperiment = (seed: string, params: Partial<PlanetParams>, origin?: Partial<OriginConfig>) => {
    setPlaying(false);
    simulationRef.current.reset(seed, params, origin);
    setSelectedLineage(null);
    setSelectedEvent(null);
    refresh();
    setView("planet");
  };

  const saveExperiment = () => {
    const payload = simulationRef.current.exportExperiment();
    const record: SavedExperiment = { id: `${Date.now()}-${summary.seed}`, title: summary.seed.replaceAll("-", " "), savedAt: new Date().toISOString(), payload };
    setLibrary((items) => [record, ...items.filter((item) => item.title !== record.title)].slice(0, 12));
    notify("Experiment saved in this browser.");
  };

  const loadExperiment = (record: SavedExperiment) => {
    try {
      simulationRef.current = HabitatSimulation.fromExport(JSON.parse(record.payload));
      setPlaying(false); refresh(); setView("planet"); notify("Experiment loaded.");
    } catch { notify("Saved experiment could not be loaded."); }
  };

  const exportExperiment = () => {
    const blob = new Blob([simulationRef.current.exportExperiment()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `habitat-${summary.seed}.json`; link.click(); URL.revokeObjectURL(url);
    notify("Experiment exported.");
  };

  const importExperiment = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) return notify("Import rejected: file exceeds 1.5 MB.");
    try {
      simulationRef.current = HabitatSimulation.fromExport(JSON.parse(await file.text()));
      setPlaying(false); refresh(); setView("planet"); notify("Experiment imported.");
    } catch { notify("Import failed: invalid or unsupported experiment JSON."); }
  };

  return <main className="app-shell">
    <aside className="rail" aria-label="Primary navigation">
      <button className="brand" onClick={() => setView("planet")} aria-label="Habitat Sim home" title="Home (H)"><span><Sparkles size={20}/></span><b>H</b></button>
      <nav>{NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)} aria-label={label} aria-current={view === id ? "page" : undefined} title={label}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="rail-foot"><span>model</span><strong>v1.0</strong></div>
    </aside>

    <section className="workspace">
      <header className="workspace-head">
        <div><span className="eyebrow">Habitat Sim / {view}</span><h1>{summary.diagnostic.title}</h1></div>
        <div className="head-stats"><Metric label="Age" value={formatAge(summary.ageMyr)} /><Metric label="Habitability" value={`${(summary.habitabilityScore * 100).toFixed(0)}%`} tone={summary.habitabilityScore > .55 ? "good" : "warn"} /><Metric label="Biosphere" value={summary.biodiversity ? `${summary.biodiversity} lineages` : "sterile"} /></div>
      </header>

      <div className="workspace-body">
        {view === "planet" && <PlanetView summary={summary} />}
        {view === "origins" && <OriginsView summary={summary} onOriginChange={updateOrigin} />}
        {view === "biosphere" && <BiosphereView summary={summary} onSelectLineage={(lineage) => { setSelectedLineage(lineage); setView("lineages"); }} />}
        {view === "lineages" && <LineagesView summary={summary} selected={selectedLineage} onSelect={setSelectedLineage} />}
        {view === "timeline" && <TimelineView summary={summary} selected={selectedEvent} onSelect={setSelectedEvent} />}
        {view === "lab" && <LabView summary={summary} library={library} onReset={resetExperiment} onIntervene={(intervention) => { simulationRef.current.addIntervention(intervention); simulationRef.current.step(.01); refresh(); notify(intervention.scheduledAgeMyr <= summary.ageMyr ? "Intervention applied." : "Intervention scheduled."); }} onSave={saveExperiment} onLoad={loadExperiment} onDelete={(id) => setLibrary((items) => items.filter((item) => item.id !== id))} onExport={exportExperiment} onImport={importExperiment} />}
      </div>

      <footer className="transport" aria-label="Simulation controls">
        <div className="transport-main"><button className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause simulation" : "Play simulation"}>{playing ? <Pause/> : <Play/>}</button><button onClick={() => { simulationRef.current.step(5); refresh(); }} title="Advance 5 million years"><StepForward/>Step</button><button onClick={() => resetExperiment(summary.seed, summary.state.params, summary.state.origin)}><RotateCcw/>Reset</button><label><Gauge size={17}/><span>Rate</span><select aria-label="Simulation rate" value={speedIndex} onChange={(event) => setSpeedIndex(Number(event.target.value))}>{SPEEDS.map((speed, index) => <option value={index} key={speed.label}>{speed.label}</option>)}</select></label></div>
        <div className="intervention-bar"><Sparkles size={17}/><select aria-label="Quick intervention" value={quickIntervention} onChange={(event) => setQuickIntervention(event.target.value as InterventionType)}>{INTERVENTION_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="accent-button" onClick={applyQuickIntervention}>Intervene now<ChevronRight size={16}/></button></div>
        <div className="simulation-state"><i className={playing ? "pulse" : ""}/><span>{playing ? "running" : "paused"}</span><strong>{SPEEDS[speedIndex].label}</strong></div>
      </footer>
    </section>
    <div className={toast ? "toast visible" : "toast"} role="status" aria-live="polite">{toast}</div>
  </main>;
}

const INTERVENTION_OPTIONS: Array<[InterventionType, string]> = [
  ["organic-asteroid", "Carbonaceous asteroid"], ["ice-comet", "Ice-rich comet"], ["nutrient-deposition", "Nutrient deposition"],
  ["volcanic-pulse", "Volcanic pulse"], ["stellar-flare", "Stellar flare"], ["quiet-star", "Quiet-star interval"],
  ["microbial-seed", "Speculative microbial seed"], ["fungal-spores", "Speculative fungal spores"], ["sterilizing-impact", "Sterilizing impact"]
];

function LabView({ summary, library, onReset, onIntervene, onSave, onLoad, onDelete, onExport, onImport }: {
  summary: SimulationSummary;
  library: SavedExperiment[];
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
  const [preset, setPreset] = useState("earthlike");
  const [interventionType, setInterventionType] = useState<InterventionType>("organic-asteroid");
  const [magnitude, setMagnitude] = useState(.65);
  const [delay, setDelay] = useState(0);

  useEffect(() => { setSeed(summary.seed); setParams(structuredClone(summary.state.params)); }, [summary.seed, summary.state.params]);

  const applyPreset = (id: string) => {
    setPreset(id);
    const patch = PLANET_PRESETS[id].params;
    setParams(normalizeParams({ ...DEFAULT_PARAMS, ...patch, seed, atmosphere: patch.atmosphere || DEFAULT_PARAMS.atmosphere }));
  };

  const updateParam = (key: keyof PlanetParams, value: number) => setParams((current) => normalizeParams({ ...current, [key]: value }));

  return <section className="lab-layout" data-testid="lab-view">
    <div className="lab-column">
      <PanelTitle eyebrow="Experiment builder" title="Planet and star" aside={<Tag tone="coarse">reset required</Tag>} />
      <div className="field-row"><label><span>Seed</span><input value={seed} onChange={(event) => setSeed(event.target.value)} /></label><button onClick={() => setSeed(makeSeed())}>Randomize</button></div>
      <label className="select-field"><span>Planet preset</span><select value={preset} onChange={(event) => applyPreset(event.target.value)}>{Object.entries(PLANET_PRESETS).map(([id, item]) => <option value={id} key={id}>{item.label}</option>)}</select><small>{PLANET_PRESETS[preset].description}</small></label>
      <div className="parameter-grid">{PARAM_FIELDS.map((field) => <label className="range-field" key={field.key}><span>{field.label}<strong>{Number(params[field.key]).toFixed(field.step < .1 ? 2 : 0)} {field.unit}</strong></span><input type="range" min={field.min} max={field.max} step={field.step} value={Number(params[field.key])} onChange={(event) => updateParam(field.key, Number(event.target.value))} /></label>)}</div>
      <PanelTitle eyebrow="Initial atmosphere" title="Gas fractions" />
      <div className="gas-grid">{GAS_KEYS.map((gas) => <label key={gas}><span>{gas.toUpperCase()}</span><input type="number" min="0" max="1" step="0.001" value={params.atmosphere[gas].toFixed(3)} onChange={(event) => setParams((current) => normalizeParams({ ...current, atmosphere: { ...current.atmosphere, [gas]: Number(event.target.value) } }))} /></label>)}</div>
      <button className="primary wide" onClick={() => onReset(seed, params, PLANET_PRESETS[preset].origin)}><Activity/>Generate planet</button>
    </div>

    <div className="lab-column">
      <PanelTitle eyebrow="Event composer" title="Intervene during history" aside={<Tag tone={interventionType.includes("seed") || interventionType.includes("spores") ? "speculative" : "coarse"}>{interventionType.includes("seed") || interventionType.includes("spores") ? "speculative" : "coarse"}</Tag>} />
      <label className="select-field"><span>Intervention</span><select value={interventionType} onChange={(event) => setInterventionType(event.target.value as InterventionType)}>{INTERVENTION_OPTIONS.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
      <label className="range-field"><span>Magnitude<strong>{Math.round(magnitude * 100)}%</strong></span><input type="range" min=".05" max="1" step=".01" value={magnitude} onChange={(event) => setMagnitude(Number(event.target.value))} /></label>
      <label className="range-field"><span>Delay from current age<strong>{delay.toFixed(0)} Myr</strong></span><input type="range" min="0" max="1000" step="10" value={delay} onChange={(event) => setDelay(Number(event.target.value))} /></label>
      <button className="accent-button wide" onClick={() => { const intervention = defaultIntervention(interventionType, summary.ageMyr + delay, summary.state.interventions.length + 1); intervention.magnitude = magnitude; onIntervene(intervention); }}><Sparkles/> {delay ? "Schedule intervention" : "Apply intervention now"}</button>
      <p className="model-note">Biological cargo faces survival gates. Fungal spores require an oxygenated, wet, food-bearing biosphere; their arrival is explicitly speculative.</p>

      <PanelTitle eyebrow="Experiment library" title="Local records" />
      <div className="library-actions"><button onClick={onSave}><Save/>Save</button><button onClick={onExport}><Download/>Export</button><label className="file-button"><Upload/>Import<input type="file" accept="application/json,.json" onChange={(event) => onImport(event.target.files?.[0])}/></label></div>
      <div className="saved-list">{library.map((record) => <article key={record.id}><span><strong>{record.title}</strong><small>{new Date(record.savedAt).toLocaleString()}</small></span><div><button onClick={() => onLoad(record)}>Load</button><button className="danger" onClick={() => onDelete(record.id)}><CircleStop/>Delete</button></div></article>)}{!library.length && <p className="model-note">No saved experiments. Saved data remains in this browser unless exported.</p>}</div>
    </div>
  </section>;
}
