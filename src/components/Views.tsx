import { Atom, CircleDot, Dna, GitBranch, Leaf, Network, Orbit, Radio, Shield, Sparkles, Telescope, Waves, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import { ORIGIN_PRESETS, STRUCTURE_INFO } from "../simulation/constants";
import type { FoodWebLink, Lineage, LineageDiagnostics, OriginConfig, OriginTheoryId, SimulationSummary, TimelineEvent } from "../simulation/types";
import { Meter, Metric, PanelTitle, Tag, formatAge, formatPopulation } from "./Primitives";
import { PlanetVisual } from "./PlanetVisual";

export function PlanetView({ summary }: { summary: SimulationSummary }) {
  const { state } = summary;
  const atmosphere = Object.entries(state.atmosphere).sort((a, b) => b[1] - a[1]);
  const { observables } = summary;
  const hzPosition = Math.max(0, Math.min(100, (summary.habitableZoneFlux - observables.habitableZoneOuterFlux) / (observables.habitableZoneInnerFlux - observables.habitableZoneOuterFlux) * 100));
  return <section className="view-grid planet-view" data-testid="planet-view">
    <div className="hero-card">
      <div className="hero-copy">
        <span className="eyebrow">Single-world observatory</span>
        <h2>{summary.seed.replaceAll("-", " ")}</h2>
        <p>{summary.diagnostic.detail}</p>
        <div className="tag-row"><Tag tone={summary.habitableZoneStatus === "temperate-flux" ? "good" : "warn"}>{summary.habitableZoneStatus.replaceAll("-", " ")}</Tag><Tag tone={summary.biodiversity ? "good" : "neutral"}>{summary.biosphereStatus}</Tag><Tag tone="coarse">{observables.stellarArchitecture.replaceAll("-", " ")}</Tag>{state.params.biochemistryMode === "unsupported-alternative" && <Tag tone="speculative">terrestrial life engine disabled</Tag>}</div>
      </div>
      <CausalSystemsRibbon summary={summary}/>
      <PlanetVisual summary={summary} />
    </div>
    <div className="metrics-block observatory-card">
      <PanelTitle eyebrow="Orbital observatory" title="World intelligence" aside={<Telescope size={18}/>} />
      <div className="orbit-climate-instrument">
        <div className="orbit-mini" aria-label={`Orbit spans ${observables.periapsisAu.toFixed(2)} to ${observables.apoapsisAu.toFixed(2)} astronomical units`}><i/><b style={{ "--eccentricity": observables.orbitalForcingAmplitude } as CSSProperties}/><span>{observables.stellarClass}-class</span></div>
        <div><span>Orbit forcing</span><strong>{observables.apoapsisFlux.toFixed(2)}–{observables.periapsisFlux.toFixed(2)} S⊕</strong><small>{Math.round(observables.orbitalForcingAmplitude * 100)}% amplitude · solar day {observables.solarDayHours > 100_000 ? "near synchronous" : `${observables.solarDayHours.toFixed(1)} h`}</small></div>
        <div><span>Climate regime</span><strong>{observables.climateRegime.replaceAll("-", " ")}</strong><small>{observables.absorbedStellarWm2.toFixed(0)} W/m² absorbed · albedo {observables.effectiveAlbedo.toFixed(2)}</small></div>
      </div>
      <div className="hz-regime" aria-label="Conservative habitable zone position"><span>maximum greenhouse <b>{observables.habitableZoneOuterFlux.toFixed(2)} S⊕</b></span><i><b style={{ left: `${hzPosition}%` }}/></i><span>runaway greenhouse <b>{observables.habitableZoneInnerFlux.toFixed(2)} S⊕</b></span></div>
      <div className="metric-grid observables-grid">
        <Metric label="Stellar flux" value={`${summary.habitableZoneFlux.toFixed(2)} S⊕`} hint="Incident energy relative to Earth; habitable-zone context is not proof of habitability." tone={summary.habitableZoneStatus === "temperate-flux" ? "good" : "warn"} />
        <Metric label="Companion flux" value={`${observables.companionStellarFlux.toFixed(2)} S⊕`} hint="Aggregate companion irradiance; not an N-body solution." tone={observables.companionFluxFraction > .2 ? "warn" : "neutral"}/>
        <Metric label="Multi-star variation" value={`${(observables.multiStarVariabilityIndex * 100).toFixed(0)} index`} hint="Exploratory variability proxy from companion share and configured amplitude." tone={observables.multiStarVariabilityIndex > .35 ? "warn" : "neutral"}/>
        <Metric label="Orbital period" value={`${observables.orbitalPeriodDays.toFixed(1)} d`} />
        <Metric label="Surface gravity" value={`${observables.gravityEarth.toFixed(2)} g⊕`} />
        <Metric label="Escape velocity" value={`${observables.escapeVelocityKmS.toFixed(2)} km/s`} />
        <Metric label="Bulk density" value={`${observables.bulkDensityGcm3.toFixed(2)} g/cm³`} />
        <Metric label="High-energy stress" value={`${(observables.highEnergyFluxIndex * 100).toFixed(0)} index`} tone={observables.highEnergyFluxIndex > .6 ? "warn" : "neutral"} />
        <Metric label="Photosynthetic light" value={`${(observables.photosyntheticPhotonIndex * 100).toFixed(0)} index`} />
        <Metric label="Stellar lifetime used" value={`${(observables.stellarAgeFraction * 100).toFixed(0)}%`} />
        <Metric label="Radiative equilibrium" value={`${observables.equilibriumTemperatureC.toFixed(1)}°C`} />
        <Metric label="Greenhouse delta" value={`+${observables.greenhouseDeltaC.toFixed(1)}°C`} tone={observables.greenhouseDeltaC > 70 ? "warn" : "neutral"} />
        <Metric label="Tidal-lock risk" value={observables.tidalLockingRisk} tone={observables.tidalLockingRisk === "high" ? "warn" : "neutral"} />
        <Metric label="Ocean pH proxy" value={state.surface.ph.toFixed(2)} />
      </div>
      <div className="index-row"><Meter label="Atmospheric retention" value={observables.atmosphericRetentionIndex} color="#78d9ff"/><Meter label="Climate buffer" value={observables.climateBufferIndex} color="#76e2a4"/><Meter label="Redox disequilibrium" value={observables.redoxDisequilibriumIndex} color="#bc9bea"/></div>
      <div className="coupled-ledger"><section><span><Orbit size={13}/> {observables.tectonicRegime}</span><div><Meter label="Internal heat" value={observables.internalHeatFluxIndex} color="#ffbd64"/><Meter label="Weathering" value={observables.weatheringFluxIndex} color="#c58d65"/><Meter label="Outgassing" value={observables.outgassingFluxIndex} color="#ff7955"/></div></section><section><span><Waves size={13}/> Accessible nutrients</span><div><Meter label="Phosphorus" value={observables.phosphorusAccess} color="#d1c76a"/><Meter label="Nitrogen" value={observables.nitrogenAccess} color="#78d9ff"/><Meter label="Iron" value={observables.ironAccess} color="#f18b55"/></div></section></div>
      <div className="risk-register"><span className={observables.snowballRisk > .5 ? "elevated" : ""}>snowball <b>{Math.round(observables.snowballRisk * 100)}</b></span><span className={observables.runawayGreenhouseRisk > .5 ? "elevated" : ""}>runaway <b>{Math.round(observables.runawayGreenhouseRisk * 100)}</b></span><span className={observables.abioticOxygenRisk > .45 ? "elevated" : ""}>abiotic O₂ <b>{Math.round(observables.abioticOxygenRisk * 100)}</b></span></div>
    </div>
    <div className="system-card atmosphere-card">
      <PanelTitle eyebrow="Atmospheric ledger" title="Partial pressures" aside={<strong>{state.atmospherePressureBar.toFixed(2)} bar total</strong>} />
      <div className="composition-list">{atmosphere.map(([gas, value]) => <div key={gas}><span>{gas.toUpperCase()}</span><i><b style={{ width: `${Math.max(1, value * 100)}%` }} /></i><strong>{(value * state.atmospherePressureBar).toFixed(value < .01 ? 4 : 3)} bar</strong></div>)}</div>
      <div className="forcing-stack"><span>Estimated greenhouse contributions</span>{Object.entries(observables.greenhouseContributionsC).filter(([, value]) => Number(value) > .1).map(([gas, value]) => <i key={gas}><b>{gas.toUpperCase()}</b><em>+{Number(value).toFixed(1)}°C</em></i>)}</div>
    </div>
    <BottleneckBoard summary={summary}/>
  </section>;
}

function CausalSystemsRibbon({ summary }: { summary: SimulationSummary }) {
  const systems = [
    { label: "Star + orbit", value: 1 - summary.observables.highEnergyFluxIndex * .55, readout: `${summary.observables.stellarClass} · ${summary.habitableZoneFlux.toFixed(2)} S⊕` },
    { label: "Climate", value: summary.observables.climateStabilityIndex, readout: summary.observables.climateRegime.replaceAll("-", " ") },
    { label: "Geochemistry", value: Math.min(summary.observables.phosphorusAccess, summary.observables.nitrogenAccess, summary.observables.ironAccess), readout: summary.observables.tectonicRegime },
    { label: "Origin gates", value: summary.originDiagnostics.readiness, readout: summary.originDiagnostics.limitingGate.label },
    { label: "Biosphere", value: summary.biodiversity ? Math.min(1, summary.biodiversity / 12 + summary.ecosystem.primaryProductivityIndex * .4) : 0, readout: summary.biosphereStatus },
    { label: "Complexity", value: summary.ecosystem.ecologicalComplexity, readout: summary.dominantStage.replaceAll("-", " ") }
  ];
  const limiting = systems.reduce((lowest, system) => system.value < lowest.value ? system : lowest);
  return <div className="systems-ribbon" aria-label="Causal planetary systems chain">{systems.map((system, index) => <div key={system.label} className={system === limiting ? "limiting" : ""} style={{ "--system": `${Math.max(2, system.value * 100)}%` } as CSSProperties}><i>{String(index + 1).padStart(2, "0")}</i><span><strong>{system.label}</strong><small>{system.readout}</small></span>{index < systems.length - 1 && <b>›</b>}</div>)}</div>;
}

function BottleneckBoard({ summary }: { summary: SimulationSummary }) {
  const bottlenecks = summary.limitingFactors.slice(0, 3);
  const strongest = [...summary.limitingFactors].sort((a, b) => b.score - a.score)[0];
  return <div className="system-card bottleneck-card"><PanelTitle eyebrow="Causal intelligence" title="Why now / what limits next" aside={<Zap size={18}/>} />
    <div className="driver-callout"><span>Strongest driver</span><strong>{strongest.label}</strong><small>{strongest.detail}</small></div>
    <div className="bottleneck-list">{bottlenecks.map((factor, index) => <article key={factor.id}><i>{String(index + 1).padStart(2, "0")}</i><div><span>{factor.label}<Tag tone={factor.confidence}>{factor.confidence}</Tag></span><strong>{factor.detail}</strong><small>{factor.counterfactual}</small></div><em>{factor.score.toFixed(2)}</em></article>)}</div>
    <p className="model-note">Scores are model indices, not measured probabilities. Each card exposes a counterfactual rather than implying a single inevitable path.</p>
  </div>;
}

function originContextFit(summary: SimulationSummary, theory: OriginTheoryId): number {
  if (theory === "hydrothermal") return summary.state.surface.hydrothermalActivity;
  if (theory === "pond") return summary.state.surface.wetDryCycling;
  if (theory === "rna-first") return Math.min(1, summary.state.surface.wetDryCycling * .55 + summary.state.chemistry.nucleotides * .45);
  if (theory === "atmospheric") return (summary.state.origin.energy + summary.state.chemistry.simpleOrganics / 3) / 2;
  if (theory === "uv-network") return (summary.state.origin.energy + summary.state.surface.wetDryCycling) / 2;
  if (theory === "ice-eutectic") return summary.state.surface.ice * .8 + (1 - summary.state.surface.radiation) * .2;
  if (theory === "mineral-template") return summary.state.origin.catalysts * .62 + summary.state.surface.nutrients * .38;
  if (theory === "lipid-first") return Math.min(1, summary.state.chemistry.lipids * .7 + summary.state.surface.wetDryCycling * .3);
  if (theory === "exogenous" || theory === "lithopanspermia") return summary.state.origin.exogenousDose;
  return summary.prebioticReadiness;
}

export function OriginsView({ summary, onOriginChange }: { summary: SimulationSummary; onOriginChange: (origin: Partial<OriginConfig>) => void }) {
  const { chemistry, origin } = summary.state;
  const mechanisms = Object.values(ORIGIN_PRESETS).filter((preset) => !["exogenous", "lithopanspermia", "custom"].includes(preset.theory));
  const deliveryOverlays = Object.values(ORIGIN_PRESETS).filter((preset) => ["exogenous", "lithopanspermia"].includes(preset.theory));
  return <section className="view-stack" data-testid="origins-view">
    <PanelTitle eyebrow="Origin laboratory" title="Test pathways, not certainties" aside={<Tag tone={ORIGIN_PRESETS[origin.theory].evidence}>{ORIGIN_PRESETS[origin.theory].evidence}</Tag>} />
    <div className="origin-layout">
      <div className="origin-hypothesis-stack">
        <div className="theory-grid">{mechanisms.map((preset) => {
          const fit = originContextFit(summary, preset.theory);
          return <button key={preset.theory} className={origin.theory === preset.theory ? "theory-card active" : "theory-card"} onClick={() => onOriginChange(preset)} aria-pressed={origin.theory === preset.theory}><span>{preset.theory === "hydrothermal" ? <Waves /> : <Atom />}</span><strong>{preset.label}</strong><p>{preset.description}</p><div className="theory-fit"><i><b style={{width:`${Math.max(2, Math.min(100, fit * 100))}%`}}/></i><em>model alignment {Math.round(fit * 100)}</em></div><Tag tone={preset.evidence}>{preset.evidence}</Tag></button>;
        })}</div>
        <section className="delivery-overlay-lab" aria-labelledby="delivery-overlay-title">
          <header><span><Sparkles/><b id="delivery-overlay-title">Delivery and relocation overlays</b></span><small>These change the starting inventory or import life; they are not mechanisms explaining life&rsquo;s first emergence.</small></header>
          <div>{deliveryOverlays.map((preset) => <button key={preset.theory} type="button" className={origin.theory === preset.theory ? "active" : ""} onClick={() => onOriginChange(preset)} aria-pressed={origin.theory === preset.theory}><span><b>{preset.label}</b><small>{preset.description}</small></span><Tag tone={preset.evidence}>{preset.evidence}</Tag></button>)}</div>
        </section>
      </div>
      <div className="chemistry-panel">
        <PanelTitle eyebrow="Reaction network" title="Six origin gates" aside={<Tag tone={summary.originDiagnostics.limitingGate.confidence}>{summary.originDiagnostics.limitingGate.confidence}</Tag>} />
        <div className="origin-gate-matrix">{summary.originDiagnostics.gates.map((gate, index) => <div key={gate.id} className={gate.id === summary.originDiagnostics.limitingGate.id ? "limiting" : ""}><i>{index + 1}</i><span><strong>{gate.label}</strong><small>{gate.detail}</small></span><em>{Math.round(gate.score * 100)}</em><b style={{ width: `${Math.max(2, gate.score * 100)}%` }}/></div>)}</div>
        <div className="origin-readouts"><div><span>Readiness</span><strong>{(summary.originDiagnostics.readiness * 100).toFixed(1)}</strong></div><div><span>Degradation</span><strong>{(summary.originDiagnostics.degradationPressure * 100).toFixed(1)}</strong></div><div><span>Hazard / Myr</span><strong>{summary.originDiagnostics.opportunityRatePerMyr.toExponential(2)}</strong></div><div><span>Delivery survival</span><strong>{(summary.originDiagnostics.deliverySurvivalIndex * 100).toFixed(1)}</strong></div></div>
        <div className="chemistry-reservoir-strip"><span title="Simple organics">ORG <b>{Math.round(chemistry.simpleOrganics / 2 * 100)}</b></span><span title="Amino-acid analogues">AA <b>{Math.round(chemistry.aminoAcids / 1.2 * 100)}</b></span><span title="Lipids">LIP <b>{Math.round(chemistry.lipids / 1.1 * 100)}</b></span><span title="Nucleotide analogues">NUC <b>{Math.round(chemistry.nucleotides / .8 * 100)}</b></span><span title="Functional polymers">POLY <b>{Math.round(chemistry.polymers / .6 * 100)}</b></span></div>
        <p className="model-note">The slowest gate constrains the internal opportunity-rate hazard. The rate compares this model’s experiments; it is not an empirical probability of abiogenesis.</p>
      </div>
    </div>
    <div className="custom-controls">
      <PanelTitle eyebrow="Protocol parameters" title="Tune this hypothesis" />
      {([
        ["energy", "Energy input"], ["catalysts", "Mineral catalysts"], ["wetDryCycling", "Wet-dry emphasis"], ["ventFlux", "Vent gradient emphasis"],
        ["exogenousDose", "Delivery dose"], ["recurrence", "Delivery recurrence"], ["survivalFraction", "Viable cargo survival"]
      ] as Array<[keyof OriginConfig, string]>).map(([key, label]) => typeof origin[key] === "number" && <label className="range-field" key={key}><span>{label}<strong>{Math.round(Number(origin[key]) * 100)}%</strong></span><input aria-label={label} type="range" min="0" max="1" step="0.01" value={Number(origin[key])} onChange={(event) => onOriginChange({ theory: "custom", [key]: Number(event.target.value) })} /></label>)}
    </div>
  </section>;
}

export function BiosphereView({ summary, onSelectLineage }: { summary: SimulationSummary; onSelectLineage: (lineage: Lineage) => void }) {
  const { lineages, foodWeb } = summary.state;
  const roles = lineages.reduce<Record<string, number>>((counts, lineage) => ({ ...counts, [lineage.trophicRole]: (counts[lineage.trophicRole] || 0) + 1 }), {});
  return <section className="view-stack" data-testid="biosphere-view">
    <PanelTitle eyebrow="Living system" title={lineages.length ? "Ecology under selection" : "No established biosphere"} aside={<Tag tone={lineages.length ? "good" : "neutral"}>{lineages.length} lineages</Tag>} />
    <div className="metric-grid ecosystem-metrics">
      <Metric label="Population" value={formatPopulation(summary.totalPopulation)} />
      <Metric label="Biomass index" value={summary.totalBiomass.toFixed(3)} />
      <Metric label="Biodiversity" value={summary.biodiversity} />
      <Metric label="Highest stage" value={summary.dominantStage.replaceAll("-", " ")} />
      <Metric label="Shannon diversity" value={summary.ecosystem.shannonDiversity.toFixed(2)} />
      <Metric label="Web connectance" value={`${(summary.ecosystem.foodWebConnectance * 100).toFixed(1)}%`} />
      <Metric label="Mean trophic level" value={summary.ecosystem.meanTrophicLevel.toFixed(2)} />
      <Metric label="Primary productivity" value={`${Math.round(summary.ecosystem.primaryProductivityIndex * 100)} idx`} />
      <Metric label="Nutrient recycling" value={`${Math.round(summary.ecosystem.recyclingEfficiency * 100)}%`} />
      <Metric label="Extinction pressure" value={`${Math.round(summary.ecosystem.extinctionPressure * 100)}%`} tone={summary.ecosystem.extinctionPressure > .55 ? "warn" : "neutral"} />
    </div>
    {!lineages.length ? <div className="sterile-intelligence">
      <div className="signal-card"><Radio/><span className="eyebrow">Biosphere signal / null</span><h3>No self-maintaining lineage detected</h3><p>Sterility is a result, not an empty screen. The observatory is tracking which prerequisite currently constrains the next modeled transition.</p><div className="signal-readout"><span>Opportunity index</span><strong>{summary.prebioticReadiness.toFixed(3)}</strong><i style={{"--signal": `${summary.prebioticReadiness * 100}%`} as CSSProperties}/></div></div>
      <BottleneckBoard summary={summary}/>
    </div> : <>
      <div className="role-strip">{Object.entries(roles).map(([role, count]) => <div key={role}><span>{role}</span><strong>{count}</strong></div>)}</div>
      <div className="ecosystem-layout">
        <div className="lineage-rank"><PanelTitle eyebrow="Populations" title="Selection board" />{[...lineages].sort((a, b) => b.population - a.population).map((lineage) => <button key={lineage.id} onClick={() => onSelectLineage(lineage)}><i style={{ opacity: .3 + lineage.fitness * .7 }}><Leaf size={15}/></i><span><strong>{lineage.name}</strong><small>{lineage.trophicRole} · {lineage.habitat}</small></span><em>{formatPopulation(lineage.population)}</em></button>)}</div>
        <FoodWeb lineages={lineages} links={foodWeb} onSelect={onSelectLineage} />
      </div>
    </>}
  </section>;
}

function FoodWeb({ lineages, links, onSelect }: { lineages: Lineage[]; links: FoodWebLink[]; onSelect: (lineage: Lineage) => void }) {
  const byId = new Map(lineages.map((lineage) => [lineage.id, lineage]));
  const mapped = lineages.slice(0, 10).map((lineage, index, shown) => ({ lineage, x: 50 + Math.cos(index / shown.length * Math.PI * 2 - Math.PI / 2) * 38, y: 50 + Math.sin(index / shown.length * Math.PI * 2 - Math.PI / 2) * 34 }));
  const positions = new Map(mapped.map((item) => [item.lineage.id, item]));
  const visibleLinks = links.filter((link) => positions.has(link.sourceId) && positions.has(link.targetId)).slice(0, 24);
  return <div className="food-web"><PanelTitle eyebrow="Energy flow" title="Ecosystem topology" aside={<Network size={18}/>} />
    <div className="ecosystem-map" aria-label="Interactive food-web topology">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{visibleLinks.map((link, index) => { const source = positions.get(link.sourceId)!; const target = positions.get(link.targetId)!; return <line key={`${link.sourceId}-${link.targetId}-${index}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={`relation-${link.relation}`} strokeWidth={Math.min(1.8, .3 + Math.log10(link.energyFlow + 1) * .22)}/>; })}</svg>
      {mapped.map(({lineage, x, y}) => <button key={lineage.id} onClick={() => onSelect(lineage)} style={{left:`${x}%`,top:`${y}%`,"--fitness":`${Math.max(8,lineage.fitness * 100)}%`} as CSSProperties} title={`${lineage.name}: ${lineage.trophicRole}`}><i/><span>{lineage.name}</span><small>{lineage.trophicRole}</small></button>)}
      {!visibleLinks.length && <p>Populations are established; direct ecological links have not yet formed.</p>}
    </div>
    <div className="flow-ledger"><span>dominant exchanges</span>{links.length ? links.slice(0, 8).map((link) => {
    const source = byId.get(link.sourceId); const target = byId.get(link.targetId); if (!source || !target) return null;
    return <button key={`${link.sourceId}-${link.targetId}-${link.relation}`} onClick={() => onSelect(source)}><span>{source.name}</span><i><b style={{ width: `${Math.min(100, 12 + Math.log10(link.energyFlow + 1) * 22)}%` }} /></i><em>{link.relation}</em><span>{target.name}</span></button>;
  }) : <div className="empty-mini"><CircleDot/>No direct consumption links yet. Producers and chemistry still dominate energy flow.</div>}</div></div>;
}

export function LineagesView({ summary, selected, onSelect }: { summary: SimulationSummary; selected: Lineage | null; onSelect: (lineage: Lineage) => void }) {
  const lineages = summary.state.lineages;
  const active = selected && lineages.find((lineage) => lineage.id === selected.id) || lineages[0] || null;
  return <section className="lineages-layout" data-testid="lineages-view">
    <div className="lineage-list"><PanelTitle eyebrow="Phylogeny" title="Living lineages" aside={<GitBranch size={18}/>} />{lineages.map((lineage) => <button className={active?.id === lineage.id ? "active" : ""} key={lineage.id} onClick={() => onSelect(lineage)}><span><strong>{lineage.name}</strong><small>{lineage.stage.replaceAll("-", " ")} · gen {lineage.generation}</small></span><em>{formatPopulation(lineage.population)}</em></button>)}{!lineages.length && <p className="model-note">Lineage records appear after a successful origin or viable biological intervention.</p>}</div>
    {active ? <LineageInspector lineage={active} diagnostics={summary.lineageDiagnostics[active.id]} /> : <EvolutionReadiness summary={summary}/>}
  </section>;
}

function EvolutionReadiness({ summary }: { summary: SimulationSummary }) {
  const gates = [
    ["Solvent persistence", summary.state.surface.liquidWater, "grounded"],
    ["Building-block inventory", Math.min(1, (summary.state.chemistry.aminoAcids + summary.state.chemistry.lipids + summary.state.chemistry.nucleotides) / .8), "speculative"],
    ["Energy gradients", summary.state.chemistry.redoxGradient, "coarse"],
    ["Compartment opportunity", Math.min(1, summary.state.chemistry.lipids + summary.state.chemistry.polymers), "speculative"],
    ["Inheritance opportunity", Math.min(1, summary.state.chemistry.nucleotides + summary.state.chemistry.polymers), "speculative"]
  ] as const;
  return <article className="evolution-readiness"><header><Orbit/><div><span className="eyebrow">Innovation graph / pre-lineage</span><h2>Evolution has no starting population</h2><p>These are functional prerequisites, not a ladder or a promise of progress.</p></div></header><div className="gate-map">{gates.map(([label, value, evidence], index) => <div key={label}><i>{index + 1}</i><span><strong>{label}</strong><small>{value > .66 ? "supportive" : value > .33 ? "partial" : "limiting"}</small></span><em>{value.toFixed(2)}</em><Tag tone={evidence}>{evidence}</Tag></div>)}</div><aside><strong>Next experiment</strong><p>{summary.limitingFactors[0].counterfactual}</p></aside></article>;
}

export function LineageInspector({ lineage, diagnostics }: { lineage: Lineage | null; diagnostics?: LineageDiagnostics }) {
  if (!lineage) return <div className="empty-state"><Dna/><h3>No lineage to inspect</h3><p>Life must establish before structures, traits, and ancestry can be examined.</p></div>;
  const traits = Object.entries(lineage.traits).filter(([key]) => !["temperatureOptimum", "temperatureTolerance"].includes(key)).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return <article className="lineage-inspector" data-testid="lineage-inspector">
    <header><div><span className="eyebrow">Representative lineage</span><h2>{lineage.name}</h2><p>{lineage.stage.replaceAll("-", " ")} · {lineage.metabolism} · {lineage.trophicRole}</p></div><div className="fitness-badge"><span>fitness</span><strong>{(lineage.fitness * 100).toFixed(0)}</strong></div></header>
    <div className="lineage-summary"><Metric label="Population" value={formatPopulation(lineage.population)} /><Metric label="Habitat" value={lineage.habitat} /><Metric label="Trophic level" value={diagnostics?.trophicLevel.toFixed(1) || "—"} /><Metric label="Born" value={formatAge(lineage.bornAtMyr)} /><Metric label="Generation" value={lineage.generation} /><Metric label="Biomass" value={lineage.biomass.toFixed(3)} /><Metric label="Structures" value={lineage.structures.length} /><Metric label="Ancestor" value={lineage.ancestorId ? lineage.ancestorId.split("-").slice(0, 2).join("-") : "origin"} /></div>
    {diagnostics && <section className="lineage-energy"><PanelTitle eyebrow="Energetic viability" title="Acquire → maintain → reproduce" aside={<Tag tone={diagnostics.realizedEnergy > .4 ? "grounded" : "coarse"}>model budget</Tag>}/><div className="energy-balance"><div><span>environmental fit</span><strong>{Math.round(diagnostics.environmentalFit * 100)}</strong><i><b style={{width:`${diagnostics.environmentalFit * 100}%`}}/></i></div><b>×</b><div><span>energy capture</span><strong>{Math.round(diagnostics.energyAcquisition * 100)}</strong><i><b style={{width:`${diagnostics.energyAcquisition * 100}%`}}/></i></div><b>−</b><div className="cost"><span>maintenance</span><strong>{Math.round(diagnostics.maintenanceBurden * 100)}</strong><i><b style={{width:`${diagnostics.maintenanceBurden * 100}%`}}/></i></div><b>=</b><div className="realized"><span>realized surplus</span><strong>{Math.round(diagnostics.realizedEnergy * 100)}</strong><i><b style={{width:`${diagnostics.realizedEnergy * 100}%`}}/></i></div></div><div className="selection-readout"><span>niche breadth <b>{Math.round(diagnostics.nicheBreadth * 100)}</b></span><span>selection pressure <b>{Math.round(diagnostics.selectionPressure * 100)}</b></span><span>ecological impact <b>{Math.round(diagnostics.ecologicalImpact * 100)}</b></span></div></section>}
    <section><PanelTitle eyebrow="Cell and body plan" title="Structures and capabilities" /><div className="structure-grid">{lineage.structures.map((structure) => <div key={structure}><Shield size={17}/><span><strong>{STRUCTURE_INFO[structure].label}</strong><small>{STRUCTURE_INFO[structure].capability}</small></span><Tag tone={STRUCTURE_INFO[structure].evidence}>{STRUCTURE_INFO[structure].evidence}</Tag></div>)}</div></section>
    <section className="inspector-split"><div><PanelTitle eyebrow="Inherited profile" title="Strongest traits" />{traits.map(([trait, value]) => <Meter key={trait} label={trait.replaceAll(/([A-Z])/g, " $1").toLowerCase()} value={value} />)}</div><div><PanelTitle eyebrow="Chemical basis" title="Element reliance" />{Object.entries(lineage.elements).map(([element, value]) => <Meter key={element} label={element} value={value} color="#c6aa75" />)}</div></section>
    <section><PanelTitle eyebrow="Functional readout" title="General capabilities" /><ul className="capability-list">{lineage.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul></section>
  </article>;
}

export function TimelineView({ summary, selected, onSelect }: { summary: SimulationSummary; selected: TimelineEvent | null; onSelect: (event: TimelineEvent) => void }) {
  const events = summary.state.timeline;
  const active = selected && events.find((event) => event.id === selected.id) || events[0] || null;
  return <section className="timeline-layout" data-testid="timeline-view">
    <div className="timeline-list"><PanelTitle eyebrow={`${events.length} recorded transitions`} title="Planetary history" />{events.map((event) => <button key={event.id} className={active?.id === event.id ? "active" : ""} onClick={() => onSelect(event)}><i className={`event-dot kind-${event.kind}`}/><span><strong>{event.title}</strong><small>{event.summary}</small></span><time>{formatAge(event.ageMyr)}</time></button>)}</div>
    <EventInspector event={active} />
  </section>;
}

function EventInspector({ event }: { event: TimelineEvent | null }) {
  if (!event) return <div className="empty-state">No events recorded.</div>;
  return <article className="event-inspector" data-testid="event-inspector"><header><div><span className="eyebrow">{event.kind} · {formatAge(event.ageMyr)}</span><h2>{event.title}</h2></div><Tag tone={event.confidence}>{event.confidence}</Tag></header><p className="event-detail">{event.detail}</p><section><PanelTitle eyebrow="Why it happened" title="Causal context"/><ul>{event.causes.map((cause) => <li key={cause}>{cause}</li>)}</ul></section><section><PanelTitle eyebrow="Recorded delta" title="Before and after"/><div className="delta-grid">{Object.entries(event.effects).map(([label, delta]) => <div key={label}><span>{label}</span><small>{String(delta.before)}{delta.unit ? ` ${delta.unit}` : ""}</small><b>→</b><strong>{typeof delta.after === "number" ? Number(delta.after).toFixed(3) : String(delta.after)}{delta.unit ? ` ${delta.unit}` : ""}</strong></div>)}</div></section><aside><strong>Model note</strong><p>{event.modelNote}</p></aside></article>;
}
