import { Atom, CircleDot, Dna, GitBranch, Leaf, Network, Shield, Sparkles, Waves } from "lucide-react";
import { ORIGIN_PRESETS, STRUCTURE_INFO } from "../simulation/constants";
import type { FoodWebLink, Lineage, OriginConfig, SimulationSummary, TimelineEvent } from "../simulation/types";
import { Meter, Metric, PanelTitle, Tag, formatAge, formatPopulation } from "./Primitives";
import { PlanetVisual } from "./PlanetVisual";

export function PlanetView({ summary }: { summary: SimulationSummary }) {
  const { state } = summary;
  const atmosphere = Object.entries(state.atmosphere).sort((a, b) => b[1] - a[1]);
  return <section className="view-grid planet-view" data-testid="planet-view">
    <div className="hero-card">
      <div className="hero-copy">
        <span className="eyebrow">Single-world observatory</span>
        <h2>{summary.seed.replaceAll("-", " ")}</h2>
        <p>{summary.diagnostic.detail}</p>
        <div className="tag-row"><Tag tone={summary.habitableZoneStatus === "temperate-flux" ? "good" : "warn"}>{summary.habitableZoneStatus.replaceAll("-", " ")}</Tag><Tag tone={summary.biodiversity ? "good" : "neutral"}>{summary.biosphereStatus}</Tag><Tag tone="coarse">comparative model</Tag></div>
      </div>
      <PlanetVisual summary={summary} />
    </div>
    <div className="metrics-block">
      <PanelTitle eyebrow="Planet state" title="Coupled systems" />
      <div className="metric-grid six">
        <Metric label="Stellar flux" value={`${summary.habitableZoneFlux.toFixed(2)} S⊕`} hint="Incident energy relative to Earth; habitable-zone context is not proof of habitability." tone={summary.habitableZoneStatus === "temperate-flux" ? "good" : "warn"} />
        <Metric label="Surface" value={`${state.surface.temperatureC.toFixed(1)}°C`} />
        <Metric label="Pressure" value={`${state.atmospherePressureBar.toFixed(2)} bar`} />
        <Metric label="Liquid water" value={`${(state.surface.liquidWater * 100).toFixed(0)}%`} />
        <Metric label="Magnetic shield" value={`${(state.interior.magneticShield * 100).toFixed(0)}%`} />
        <Metric label="Surface radiation" value={`${(state.surface.radiation * 100).toFixed(0)}%`} tone={state.surface.radiation > .55 ? "danger" : "neutral"} />
      </div>
    </div>
    <div className="system-card atmosphere-card">
      <PanelTitle eyebrow="Atmosphere" title="Gas inventory" aside={<strong>{state.atmospherePressureBar.toFixed(2)} bar</strong>} />
      <div className="composition-list">{atmosphere.map(([gas, value]) => <div key={gas}><span>{gas.toUpperCase()}</span><i><b style={{ width: `${Math.max(1, value * 100)}%` }} /></i><strong>{(value * 100).toFixed(value < .01 ? 2 : 1)}%</strong></div>)}</div>
    </div>
    <div className="system-card">
      <PanelTitle eyebrow="Interior" title="Living geology" />
      <Meter label="Interior heat" value={state.interior.heat} color="#f79655" />
      <Meter label="Core activity" value={state.interior.coreActivity} color="#ffbd64" />
      <Meter label="Tectonic recycling" value={state.interior.tectonics} color="#b48561" />
      <Meter label="Volcanism" value={state.interior.volcanism} color="#ff6b4a" />
    </div>
    <div className="system-card">
      <PanelTitle eyebrow="Surface" title="Solvent and gradients" />
      <Meter label="Ocean coverage" value={state.surface.oceanCoverage} color="#55bde8" />
      <Meter label="Nutrients" value={state.surface.nutrients} color="#d1c76a" />
      <Meter label="Hydrothermal" value={state.surface.hydrothermalActivity} color="#f18b55" />
      <Meter label="Wet-dry cycling" value={state.surface.wetDryCycling} color="#8ed9c0" />
    </div>
  </section>;
}

export function OriginsView({ summary, onOriginChange }: { summary: SimulationSummary; onOriginChange: (origin: Partial<OriginConfig>) => void }) {
  const { chemistry, origin } = summary.state;
  return <section className="view-stack" data-testid="origins-view">
    <PanelTitle eyebrow="Origin laboratory" title="Test pathways, not certainties" aside={<Tag tone={ORIGIN_PRESETS[origin.theory].evidence}>{ORIGIN_PRESETS[origin.theory].evidence}</Tag>} />
    <div className="origin-layout">
      <div className="theory-grid">{Object.values(ORIGIN_PRESETS).map((preset) => <button key={preset.theory} className={origin.theory === preset.theory ? "theory-card active" : "theory-card"} onClick={() => onOriginChange(preset)} aria-pressed={origin.theory === preset.theory}><span>{preset.theory === "hydrothermal" ? <Waves /> : preset.theory === "exogenous" || preset.theory === "lithopanspermia" ? <Sparkles /> : <Atom />}</span><strong>{preset.label}</strong><p>{preset.description}</p><Tag tone={preset.evidence}>{preset.evidence}</Tag></button>)}</div>
      <div className="chemistry-panel">
        <PanelTitle eyebrow="Current reservoirs" title="Prebiotic inventory" />
        <Meter label="Simple organics" value={chemistry.simpleOrganics / 2} color="#d39c62" />
        <Meter label="Amino-acid analogues" value={chemistry.aminoAcids / 1.2} color="#c0d782" />
        <Meter label="Lipids" value={chemistry.lipids / 1.1} color="#65d6bb" />
        <Meter label="Nucleotide analogues" value={chemistry.nucleotides / .8} color="#8ea8e8" />
        <Meter label="Functional polymers" value={chemistry.polymers / .6} color="#d28ee9" />
        <Meter label="Prebiotic readiness" value={summary.prebioticReadiness} color="var(--life)" />
        <p className="model-note">Readiness combines solvent stability, resources, energy gradients, catalytic opportunity, and accumulated building blocks. A high value opens repeated chances; it never guarantees origin.</p>
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
    {!lineages.length ? <div className="empty-state"><Dna size={36}/><h3>The planet is still sterile</h3><p>Run geological time, improve the environment, change the origin protocol, or introduce a carefully labeled intervention.</p></div> : <>
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
    <LineageInspector lineage={active} />
  </section>;
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
