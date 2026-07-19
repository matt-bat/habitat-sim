import { useCallback, useEffect, useRef, useState } from "react";
import {
  Atom, BookOpen, ChevronRight, FlaskConical, Gauge, GitBranch, Home, Leaf, Pause, Play, RotateCcw,
  Sparkles, StepForward
} from "lucide-react";
import { BiosphereView, LineagesView, OriginsView, PlanetView, TimelineView } from "./components/Views";
import { Metric, formatAge } from "./components/Primitives";
import { LabView, type SavedExperiment } from "./features/lab/LabView";
import { makeInitialWizardDraft, SimWizard } from "./features/sim-wizard/SimWizard";
import { HabitatSimulation } from "./simulation/engine";
import { makeSeed } from "./simulation/random";
import { getScenario, scenarioConfiguration } from "./simulation/presets";
import type {
  InterventionType, Lineage, OriginConfig, PlannedIntervention, PlanetParams, ScenarioConfiguration,
  SimulationSummary, TimelineEvent, UserPreset, WizardDraft
} from "./simulation/types";
import {
  createUserPreset, loadUserPresets, loadWizardDraft, parsePresetJson, persistUserPresets,
  persistWizardDraft, presetToJson
} from "./storage/presets";

type ViewId = "planet" | "origins" | "biosphere" | "lineages" | "timeline" | "lab";

const SNAPSHOT_STORAGE_KEY = "habitat-sim.experiments.v1";
const MAX_IMPORT_BYTES = 1_500_000;
const SPEEDS = [
  { label: "0.5 Myr/s", rate: .5 }, { label: "5 Myr/s", rate: 5 }, { label: "25 Myr/s", rate: 25 },
  { label: "100 Myr/s", rate: 100 }, { label: "500 Myr/s", rate: 500 }
];
const NAV_ITEMS: Array<{ id: ViewId; label: string; icon: typeof Home }> = [
  { id: "planet", label: "Planet", icon: Home }, { id: "origins", label: "Origins", icon: Atom },
  { id: "biosphere", label: "Biosphere", icon: Leaf }, { id: "lineages", label: "Lineages", icon: GitBranch },
  { id: "timeline", label: "Timeline", icon: BookOpen }, { id: "lab", label: "Lab", icon: FlaskConical }
];
const INTERVENTION_OPTIONS: Array<[InterventionType, string]> = [
  ["organic-asteroid", "Carbonaceous asteroid"], ["ice-comet", "Ice-rich comet"], ["nutrient-deposition", "Nutrient deposition"],
  ["volcanic-pulse", "Volcanic pulse"], ["stellar-flare", "Stellar flare"], ["quiet-star", "Quiet-star interval"],
  ["microbial-seed", "Speculative microbial seed"], ["fungal-spores", "Speculative fungal spores"], ["sterilizing-impact", "Sterilizing impact"],
  ["custom", "Custom material cargo"]
];

function loadSnapshotLibrary(): SavedExperiment[] {
  try {
    const value = JSON.parse(localStorage.getItem(SNAPSHOT_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.payload === "string").slice(0, 12) : [];
  } catch { return []; }
}

function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function simulationFromConfiguration(configuration: ScenarioConfiguration): HabitatSimulation {
  const simulation = new HabitatSimulation(configuration.seed, configuration.params, configuration.origin);
  configuration.interventions.forEach((item) => simulation.addIntervention(item));
  return simulation;
}

export function App() {
  const initialSeed = useRef(makeSeed());
  const initialConfiguration = useRef(scenarioConfiguration(getScenario("late-hadean-shore"), initialSeed.current));
  const simulationRef = useRef(simulationFromConfiguration(initialConfiguration.current));
  const workspaceBodyRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<SimulationSummary>(() => simulationRef.current.getSummary());
  const [view, setView] = useState<ViewId>("planet");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(2);
  const [selectedLineage, setSelectedLineage] = useState<Lineage | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [quickIntervention, setQuickIntervention] = useState<InterventionType>("organic-asteroid");
  const [toast, setToast] = useState("");
  const [snapshotLibrary, setSnapshotLibrary] = useState<SavedExperiment[]>(loadSnapshotLibrary);
  const [userPresets, setUserPresets] = useState<UserPreset[]>(loadUserPresets);
  const [wizardDraft, setWizardDraft] = useState<WizardDraft>(() => loadWizardDraft() ?? makeInitialWizardDraft(initialConfiguration.current));

  const refresh = useCallback(() => setSummary(simulationRef.current.getSummary()), []);
  const notify = useCallback((message: string) => {
    setToast(message); window.setTimeout(() => setToast(""), 3000);
  }, []);

  useEffect(() => {
    if (!playing || wizardOpen) return;
    let frame = 0; let previous = performance.now(); let lastPaint = previous;
    const tick = (now: number) => {
      const elapsed = Math.min(.1, (now - previous) / 1000); previous = now;
      simulationRef.current.step(SPEEDS[speedIndex].rate * elapsed);
      if (now - lastPaint > 180) { refresh(); lastPaint = now; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, refresh, speedIndex, wizardOpen]);

  useEffect(() => { try { localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshotLibrary)); } catch { notify("Snapshot storage is unavailable; export important runs."); } }, [notify, snapshotLibrary]);
  useEffect(() => { try { persistUserPresets(userPresets); } catch { notify("Preset storage is unavailable; export important presets."); } }, [notify, userPresets]);
  useEffect(() => { workspaceBodyRef.current?.scrollTo({ top: 0, left: 0 }); window.scrollTo({ top: 0, left: 0 }); }, [view, wizardOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") { event.preventDefault(); setPlaying(false); setWizardOpen(true); return; }
      if (wizardOpen) return;
      if (event.code === "Space") { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key === "ArrowRight") setSpeedIndex((value) => Math.min(SPEEDS.length - 1, value + 1));
      if (event.key === "ArrowLeft") setSpeedIndex((value) => Math.max(0, value - 1));
      if (event.key.toLowerCase() === "h") setView("planet");
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [wizardOpen]);

  const navigate = (next: ViewId) => {
    if (wizardOpen) { setWizardOpen(false); notify("Wizard draft kept. Reopen it from Lab or Ctrl/Command + N."); }
    setView(next);
  };
  const updateOrigin = (origin: Partial<OriginConfig>) => { simulationRef.current.setOrigin(origin); refresh(); };
  const applyQuickIntervention = () => {
    simulationRef.current.interveneNow(quickIntervention); refresh();
    setSelectedEvent(simulationRef.current.getSummary().state.timeline[0] || null); notify("Intervention applied and recorded.");
  };
  const resetExperiment = (seed: string, params: Partial<PlanetParams>, origin?: Partial<OriginConfig>, interventions: PlannedIntervention[] = []) => {
    setPlaying(false); simulationRef.current.reset(seed, params, origin);
    interventions.forEach((item) => simulationRef.current.addIntervention(item));
    setSelectedLineage(null); setSelectedEvent(null); refresh(); setView("planet");
  };
  const saveSnapshot = () => {
    const payload = simulationRef.current.exportExperiment();
    const record: SavedExperiment = { id: `${Date.now()}-${summary.seed}`, title: summary.seed.replaceAll("-", " "), savedAt: new Date().toISOString(), payload };
    setSnapshotLibrary((items) => [record, ...items.filter((item) => item.title !== record.title)].slice(0, 12)); notify("Simulation snapshot saved in this browser.");
  };
  const loadSnapshot = (record: SavedExperiment) => {
    try { simulationRef.current = HabitatSimulation.fromExport(JSON.parse(record.payload)); setPlaying(false); refresh(); setView("planet"); notify("Simulation snapshot loaded."); }
    catch { notify("Saved snapshot could not be loaded."); }
  };
  const exportExperiment = () => { downloadText(simulationRef.current.exportExperiment(), `habitat-${summary.seed}.json`); notify("Simulation snapshot exported."); };
  const importExperiment = async (file?: File) => {
    if (!file) return; if (file.size > MAX_IMPORT_BYTES) return notify("Import rejected: file exceeds 1.5 MB.");
    try { simulationRef.current = HabitatSimulation.fromExport(JSON.parse(await file.text())); setPlaying(false); refresh(); setView("planet"); notify("Simulation snapshot imported."); }
    catch { notify("Import failed: invalid or unsupported experiment JSON."); }
  };

  const updateWizardDraft = useCallback((draft: WizardDraft) => {
    setWizardDraft(draft);
    try { persistWizardDraft(draft); } catch { notify("Wizard draft could not be persisted; export a preset before leaving."); }
  }, [notify]);
  const launchConfiguration = (configuration: ScenarioConfiguration, sourcePresetId: string) => {
    resetExperiment(configuration.seed, configuration.params, configuration.origin, configuration.interventions);
    const cleanDraft = { ...wizardDraft, sourcePresetId, configuration: structuredClone(configuration), dirty: false, updatedAt: new Date().toISOString() };
    setWizardDraft(cleanDraft); try { persistWizardDraft(cleanDraft); } catch { /* surfaced by subsequent edits */ }
    setWizardOpen(false); notify("Reviewed world launched with its deterministic intervention plan.");
  };
  const savePreset = (configuration: ScenarioConfiguration, name: string, sourcePresetId: string, existing?: UserPreset) => {
    const builtInParent = getScenario(sourcePresetId).id === sourcePresetId ? sourcePresetId : existing?.basePresetId ?? sourcePresetId;
    const preset = createUserPreset(configuration, name, `Custom configuration derived from ${builtInParent}.`, builtInParent, existing);
    setUserPresets((items) => [preset, ...items.filter((item) => item.id !== preset.id)]); notify(existing ? "Custom preset updated." : "Custom preset saved.");
  };
  const duplicatePreset = (preset: UserPreset) => {
    const copy = createUserPreset(preset.configuration, `${preset.name} copy`, preset.description, preset.basePresetId ?? preset.id);
    setUserPresets((items) => [copy, ...items]); notify("Preset duplicated.");
  };
  const exportPreset = (preset: UserPreset) => { downloadText(presetToJson(preset), `${preset.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}.habitat-preset.json`); notify("Preset exported with metadata and configuration."); };
  const importPreset = async (file?: File) => {
    if (!file) return;
    try {
      const imported = parsePresetJson(await file.text());
      const conflict = userPresets.some((item) => item.id === imported.id || item.name.toLowerCase() === imported.name.toLowerCase());
      const preset = conflict ? createUserPreset(imported.configuration, `${imported.name} (imported)`, imported.description, imported.basePresetId) : imported;
      setUserPresets((items) => [preset, ...items]); notify(conflict ? "Preset imported as a separate copy to preserve both versions." : "Preset imported.");
    } catch (error) { notify(error instanceof Error ? error.message : "Preset import failed."); }
  };

  return <main className="app-shell">
    <aside className="rail" aria-label="Primary navigation">
      <button className="brand" onClick={() => navigate("planet")} aria-label="Habitat Sim home" title="Home (H)"><span><Sparkles size={20}/></span><b>H</b></button>
      <nav>{NAV_ITEMS.map(({id,label,icon:Icon}) => <button key={id} className={!wizardOpen&&view===id?"active":""} onClick={()=>navigate(id)} aria-label={label} aria-current={!wizardOpen&&view===id?"page":undefined} title={label}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="rail-foot"><span>model</span><strong>v1.1</strong></div>
    </aside>

    <section className={wizardOpen ? "workspace wizard-active" : "workspace"}>
      {!wizardOpen && <header className="workspace-head"><div><span className="eyebrow"><i className="live-beacon"/> Habitat Sim / {view} / deterministic observatory</span><h1>{summary.diagnostic.title}</h1></div><div className="head-stats"><Metric label="Age" value={formatAge(summary.ageMyr)}/><Metric label="Habitability" value={`${(summary.habitabilityScore*100).toFixed(0)}%`} tone={summary.habitabilityScore>.55?"good":"warn"}/><Metric label="Biosphere" value={summary.biodiversity?`${summary.biodiversity} lineages`:"sterile"}/></div></header>}
      <div className={wizardOpen ? "workspace-body wizard-body" : "workspace-body"} ref={workspaceBodyRef} role="region" aria-label={wizardOpen ? "Simulation setup workspace" : `${view} workspace`} tabIndex={0}>
        {wizardOpen ? <SimWizard initialDraft={wizardDraft} userPresets={userPresets} onDraftChange={updateWizardDraft} onClose={()=>{setWizardOpen(false);setView("lab")}} onLaunch={launchConfiguration} onSavePreset={savePreset} onDuplicatePreset={duplicatePreset} onDeletePreset={(preset)=>setUserPresets((items)=>items.filter((item)=>item.id!==preset.id))} onRestorePreset={(preset)=>setUserPresets((items)=>[preset,...items.filter((item)=>item.id!==preset.id)])} onExportPreset={exportPreset} onImportPreset={importPreset}/>
        : <>{view==="planet"&&<PlanetView summary={summary}/>} {view==="origins"&&<OriginsView summary={summary} onOriginChange={updateOrigin}/>} {view==="biosphere"&&<BiosphereView summary={summary} onSelectLineage={(lineage)=>{setSelectedLineage(lineage);setView("lineages")}}/>} {view==="lineages"&&<LineagesView summary={summary} selected={selectedLineage} onSelect={setSelectedLineage}/>} {view==="timeline"&&<TimelineView summary={summary} selected={selectedEvent} onSelect={setSelectedEvent}/>} {view==="lab"&&<LabView summary={summary} library={snapshotLibrary} customPresetCount={userPresets.length} onOpenWizard={()=>{setPlaying(false);setWizardOpen(true)}} onReset={resetExperiment} onIntervene={(intervention)=>{simulationRef.current.addIntervention(intervention);simulationRef.current.step(.01);refresh();notify(intervention.scheduledAgeMyr<=summary.ageMyr?"Intervention applied.":"Intervention scheduled.")}} onSave={saveSnapshot} onLoad={loadSnapshot} onDelete={(id)=>setSnapshotLibrary((items)=>items.filter((item)=>item.id!==id))} onExport={exportExperiment} onImport={importExperiment}/>}</>}
      </div>

      {!wizardOpen && <footer className="transport" aria-label="Simulation controls"><div className="transport-main"><button className="play-button" onClick={()=>setPlaying((value)=>!value)} aria-label={playing?"Pause simulation":"Play simulation"}>{playing?<Pause/>:<Play/>}</button><button onClick={()=>{simulationRef.current.step(5);refresh()}} title="Advance 5 million years"><StepForward/>Step</button><button onClick={()=>resetExperiment(summary.seed,summary.state.params,summary.state.origin)}><RotateCcw/>Reset</button><label><Gauge size={17}/><span>Rate</span><select aria-label="Simulation rate" value={speedIndex} onChange={(event)=>setSpeedIndex(Number(event.target.value))}>{SPEEDS.map((speed,index)=><option value={index} key={speed.label}>{speed.label}</option>)}</select></label></div><div className="intervention-bar"><Sparkles size={17}/><select aria-label="Quick intervention" value={quickIntervention} onChange={(event)=>setQuickIntervention(event.target.value as InterventionType)}>{INTERVENTION_OPTIONS.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button className="accent-button" onClick={applyQuickIntervention}>Intervene now<ChevronRight size={16}/></button></div><div className="simulation-state"><i className={playing?"pulse":""}/><span>{playing?"running":"paused"}</span><strong>{SPEEDS[speedIndex].label}</strong></div></footer>}
    </section>
    <div className={toast?"toast visible":"toast"} role="status" aria-live="polite">{toast}</div>
  </main>;
}
