import { Atom, CircleDot, Dna, GitBranch, Leaf, Network, Orbit, Radio, Shield, Sparkles, Telescope, Waves, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import { ORIGIN_PRESETS, STRUCTURE_INFO } from "../simulation/constants";
import type { FoodWebLink, Lineage, OriginConfig, SimulationSummary, TimelineEvent } from "../simulation/types";
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
        <div className="tag-row"><Tag tone={summary.habitableZoneStatus === "temperate-flux" ? "good" : "warn"}>{summary.habitableZoneStatus.replaceAll("-", " ")}</Tag><Tag tone={summary.biodiversity ? "good" : "neutral"}>{summary.biosphereStatus}</Tag><Tag tone="coarse">causal comparative model</Tag></div>
      </div>
      <PlanetVisual summary={summary} />
    </div>
    <div className="metrics-block observatory-card">
      <PanelTitle eyebrow="Orbital observatory" title="World intelligence" aside={<Telescope size={18}/>} />
      <div className="hz-regime" aria-label="Conservative habitable zone position"><span>maximum greenhouse <b>{observables.habitableZoneOuterFlux.toFixed(2)} S⊕</b></span><i><b style={{ left: `${hzPosition}%` }}/></i><span>runaway greenhouse <b>{observables.habitableZoneInnerFlux.toFixed(2)} S⊕</b></span></div>
      <div className="metric-grid observables-grid">
        <Metric label="Stellar flux" value={`${summary.habitableZoneFlux.toFixed(2)} S⊕`} hint="Incident energy relative to Earth; habitable-zone context is not proof of habitability." tone={summary.habitableZoneStatus === "temperate-flux" ? "good" : "warn"} />
        <Metric label="Orbital period" value={`${observables.orbitalPeriodDays.toFixed(1)} d`} />
        <Metric label="Surface gravity" value={`${observables.gravityEarth.toFixed(2)} g⊕`} />
        <Metric label="Escape velocity" value={`${observables.escapeVelocityKmS.toFixed(2)} km/s`} />
        <Metric label="Radiative equilibrium" value={`${observables.equilibriumTemperatureC.toFixed(1)}°C`} />
        <Metric label="Greenhouse delta" value={`+${observables.greenhouseDeltaC.toFixed(1)}°C`} tone={observables.greenhouseDeltaC > 70 ? "warn" : "neutral"} />
        <Metric label="Tidal-lock risk" value={observables.tidalLockingRisk} tone={observables.tidalLockingRisk === "high" ? "warn" : "neutral"} />
        <Metric label="Ocean pH proxy" value={state.surface.ph.toFixed(2)} />
      </div>
      <div className="index-row"><Meter label="Atmospheric retention" value={observables.atmosphericRetentionIndex} color="#78d9ff"/><Meter label="Climate stability" value={observables.climateStabilityIndex} color="#76e2a4"/><Meter label="Redox disequilibrium" value={observables.redoxDisequilibriumIndex} color="#bc9bea"/></div>
      <div className="coupled-ledger"><section><span><Orbit size={13}/> Interior engine</span><div><Meter label="Core activity" value={state.interior.coreActivity} color="#ffbd64"/><Meter label="Tectonic recycling" value={state.interior.tectonics} color="#c58d65"/><Meter label="Volcanism" value={state.interior.volcanism} color="#ff7955"/></div></section><section><span><Waves size={13}/> Surface exchange</span><div><Meter label="Ocean coverage" value={state.surface.oceanCoverage} color="#55bde8"/><Meter label="Nutrients" value={state.surface.nutrients} color="#d1c76a"/><Meter label="Hydrothermal" value={state.surface.hydrothermalActivity} color="#f18b55"/></div></section></div>
    </div>
    <div className="system-card atmosphere-card">
      <PanelTitle eyebrow="Atmospheric ledger" title="Partial pressures" aside={<strong>{state.atmospherePressureBar.toFixed(2)} bar total</strong>} />
      <div className="composition-list">{atmosphere.map(([gas, value]) => <div key={gas}><span>{gas.toUpperCase()}</span><i><b style={{ width: `${Math.max(1, value * 100)}%` }} /></i><strong>{(value * state.atmospherePressureBar).toFixed(value < .01 ? 4 : 3)} bar</strong></div>)}</div>
    </div>
    <BottleneckBoard summary={summary}/>
  </section>;
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

export function OriginsView({ summary, onOriginChange }: { summary: SimulationSummary; onOriginChange: (origin: Partial<OriginConfig>) => void }) {
  const { chemistry, origin } = summary.state;
  return <section className="view-stack" data-testid="origins-view">
    <PanelTitle eyebrow="Origin laboratory" title="Test pathways, not certainties" aside={<Tag tone={ORIGIN_PRESETS[origin.theory].evidence}>{ORIGIN_PRESETS[origin.theory].evidence}</Tag>} />
    <div className="origin-layout">
      <div className="theory-grid">{Object.values(ORIGIN_PRESETS).map((preset) => {
        const fit = preset.theory === "hydrothermal" ? summary.state.surface.hydrothermalActivity : preset.theory === "pond" ? summary.state.surface.wetDryCycling : preset.theory === "atmospheric" ? (summary.state.origin.energy + summary.state.chemistry.simpleOrganics / 3) / 2 : preset.theory === "exogenous" || preset.theory === "lithopanspermia" ? summary.state.origin.exogenousDose : summary.prebioticReadiness;
        return <button key={preset.theory} className={origin.theory === preset.theory ? "theory-card active" : "theory-card"} onClick={() => onOriginChange(preset)} aria-pressed={origin.theory === preset.theory}><span>{preset.theory === "hydrothermal" ? <Waves /> : preset.theory === "exogenous" || preset.theory === "lithopanspermia" ? <Sparkles /> : <Atom />}</span><strong>{preset.label}</strong><p>{preset.description}</p><div className="theory-fit"><i><b style={{width:`${Math.max(2, Math.min(100, fit * 100))}%`}}/></i><em>context fit {Math.round(fit * 100)}</em></div><Tag tone={preset.evidence}>{preset.evidence}</Tag></button>;
      })}</div>
      <div className="chemistry-panel">
        <PanelTitle eyebrow="Current reservoirs" title="Prebiotic inventory" />
        <Meter label="Simple organics" value={chemistry.simpleOrganics / 2} color="#d39c62" />
        <Meter label="Amino-acid analogues" value={chemistry.aminoAcids / 1.2} color="#c0d782" />
        <Meter label="Lipids" value={chemistry.lipids / 1.1} color="#65d6bb" />
        <Meter label="Nucleotide analogues" value={chemistry.nucleotides / .8} color="#8ea8e8" />
        <Meter label="Functional polymers" value={chemistry.polymers / .6} color="#d28ee9" />
        <Meter label="Prebiotic readiness" value={summary.prebioticReadiness} color="var(--life)" />
        <p className="model-note">Readiness is a dimensionless model index combining solvent stability, resources, gradients, catalysts, and building blocks. It drives an opportunity-rate hazard; it is not a measured abiogenesis probability.</p>
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
    <div className="metric-grid six">
      <Metric label="Population" value={formatPopulation(summary.totalPopulation)} />
      <Metric label="Biomass index" value={summary.totalBiomass.toFixed(3)} />
      <Metric label="Biodiversity" value={summary.biodiversity} />
      <Metric label="Highest stage" value={summary.dominantStage.replaceAll("-", " ")} />
      <Metric label="Food-web links" value={foodWeb.length} />
      <Metric label="Extinctions" value={summary.state.extinctionCount} />
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
  return <div className="food-web"><PanelTitle eyebrow="Energy flow" title="Predator, prey, and resource links" aside={<Network size={18}/>} />{links.length ? links.slice(0, 18).map((link) => {
    const source = byId.get(link.sourceId); const target = byId.get(link.targetId); if (!source || !target) return null;
    return <button key={`${link.sourceId}-${link.targetId}-${link.relation}`} onClick={() => onSelect(source)}><span>{source.name}</span><i><b style={{ width: `${Math.min(100, 12 + Math.log10(link.energyFlow + 1) * 22)}%` }} /></i><em>{link.relation}</em><span>{target.name}</span></button>;
  }) : <div className="empty-mini"><CircleDot/>No direct consumption links yet. Producers and chemistry still dominate energy flow.</div>}</div>;
}

export function LineagesView({ summary, selected, onSelect }: { summary: SimulationSummary; selected: Lineage | null; onSelect: (lineage: Lineage) => void }) {
  const lineages = summary.state.lineages;
  const active = selected && lineages.find((lineage) => lineage.id === selected.id) || lineages[0] || null;
  return <section className="lineages-layout" data-testid="lineages-view">
    <div className="lineage-list"><PanelTitle eyebrow="Phylogeny" title="Living lineages" aside={<GitBranch size={18}/>} />{lineages.map((lineage) => <button className={active?.id === lineage.id ? "active" : ""} key={lineage.id} onClick={() => onSelect(lineage)}><span><strong>{lineage.name}</strong><small>{lineage.stage.replaceAll("-", " ")} · gen {lineage.generation}</small></span><em>{formatPopulation(lineage.population)}</em></button>)}{!lineages.length && <p className="model-note">Lineage records appear after a successful origin or viable biological intervention.</p>}</div>
    {active ? <LineageInspector lineage={active} /> : <EvolutionReadiness summary={summary}/>}
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

export function LineageInspector({ lineage }: { lineage: Lineage | null }) {
  if (!lineage) return <div className="empty-state"><Dna/><h3>No lineage to inspect</h3><p>Life must establish before structures, traits, and ancestry can be examined.</p></div>;
  const traits = Object.entries(lineage.traits).filter(([key]) => !["temperatureOptimum", "temperatureTolerance"].includes(key)).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return <article className="lineage-inspector" data-testid="lineage-inspector">
    <header><div><span className="eyebrow">Representative lineage</span><h2>{lineage.name}</h2><p>{lineage.stage.replaceAll("-", " ")} · {lineage.metabolism} · {lineage.trophicRole}</p></div><div className="fitness-badge"><span>fitness</span><strong>{(lineage.fitness * 100).toFixed(0)}</strong></div></header>
    <div className="lineage-summary"><Metric label="Population" value={formatPopulation(lineage.population)} /><Metric label="Habitat" value={lineage.habitat} /><Metric label="Born" value={formatAge(lineage.bornAtMyr)} /><Metric label="Ancestor" value={lineage.ancestorId ? lineage.ancestorId.split("-").slice(0, 2).join("-") : "origin"} /></div>
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
