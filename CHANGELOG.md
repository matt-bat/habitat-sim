# Changelog

All notable changes to Habitat Sim are documented here.

## 1.1.1 - 2026-07-19

### Added

- Five-profile browser matrix spanning desktop Chromium, Pixel 7 Chromium, desktop Firefox, desktop WebKit, and iPhone 15 WebKit.
- Automated axe-core WCAG 2 A/AA, WCAG 2.1 A/AA, and WCAG 2.2 AA scans across every root workspace and all seven Sim Wizard steps.
- Enforced 320 CSS-pixel reflow coverage for all root workspaces, Wizard steps, visible controls, and primary navigation targets.
- Deterministic gzip bundle budgets of 120 kilobytes for JavaScript and 20 kilobytes for CSS, enforced by the standard check and continuous integration.
- A sixth 320 × 568 visual profile; the finalized 44-state corpus now contains 570 scroll-depth captures across six resolutions.

### Corrected

- Lab controls and deterministic-seed rows now shrink within extreme-width grid and flex containers instead of clipping their selects or actions.
- Wizard cards, citations, source links, and contextual science links retain accessible hit areas without forcing horizontal overflow.
- Scrollable workspaces are keyboard-focusable and carry adaptive region labels for assistive technology.
- The six-destination mobile navigation fits at 320 CSS pixels while retaining 44-pixel minimum touch targets.
- Compact Wizard headings begin inside the intended top rhythm across all browser engines.
- Exhaustive accessibility scans use a scoped timeout that tolerates slower Firefox/WebKit analysis without weakening any rule or assertion.

## 1.1.0 - 2026-07-17

### Added

- Scientific observatory with temperature-dependent habitable-zone limits, orbital period, gravity, escape velocity, greenhouse delta, pH, retention, stability, and redox readouts.
- Ranked causal bottlenecks, origin-pathway context fit, sterile-biosphere intelligence, and a pre-lineage prerequisite graph.
- Custom material-cargo composer and deterministic twelve-view screenshot automation.
- Stellar age/history, spectral class, photosynthetic-light opportunity, periapsis/apoapsis forcing, solar day, bulk density, climate feedback/regime/risk, carbon-cycle, tectonic, and nutrient-access diagnostics.
- Six explicit origin gates with degradation, delivery survival, limiting-gate hazard, and ice-eutectic, mineral-template, and lipid-first protocols.
- Ecosystem diversity, connectance, trophic, productivity, recycling, extinction-pressure, and complexity statistics plus lineage energy, niche, selection, and impact diagnostics.
- Competition, mutualism, and partner-constrained endosymbiosis plus osmoregulatory, support, excretory, immune, and neural functional analogues.
- Purpose-built causal systems ribbon, orbit/climate instrument, origin matrix, ecosystem topology, lineage energy equation, and grouped live-preview experiment builder.
- Forty-image desktop/mobile screenshot automation spanning sterile/living states and internal scroll depth.
- Nineteen citation-backed built-in scenarios: four early-Earth brackets, seven origin/delivery experiments, and eight experimental planetary-system boundary cases.
- Seven-step Sim Wizard with adaptive impact guidance, contextual science notes, explicit model limits, deterministic intervention planning, and final causal review.
- Separate bounded stores for Wizard drafts, reusable user presets, and running simulation snapshots, with preset duplicate/import/export/delete/undo workflows.
- One-, two-, and three-star aggregate forcing controls, companion-flux observables, elemental availability editing, and an explicit non-aqueous model-disable boundary.
- Version-2 experiment checkpoints with exact seeded random-stream resume and stronger finite-range import hardening.
- GitHub Pages production deployment, post-deploy shell/asset verification, and public project metadata.
- A 44-state screenshot harness across five common resolutions, producing 452 full-state/depth captures plus targeted corrected-profile recaptures.

### Corrected

- Atmospheric sources and sinks now operate on partial pressures instead of silently displacing normalized gas fractions.
- Abiogenesis uses an opportunity-rate hazard; oxygen requires oxygenic producers and subtracts aggregate sinks.
- Detritus persists without being recreated from cumulative extinction count, and grazing populates producer diet history.
- Origin opportunities are limited by the weakest explicit chemistry gate and favorable precursors now face thermal, radiative, and dilution degradation.
- Legacy generic “Earth-like” presets were replaced by uncertainty-labeled pre-life Earth brackets and mechanistic origin scenarios.
- Exogenous organics and lithopanspermia are separated from local abiogenesis mechanisms as delivery/relocation overlays.
- Mobile Wizard layout no longer reserves a hidden desktop rail; every visible Wizard button has a 44-pixel touch target and all tracked panels remain free of horizontal overflow.
- Pages-form local previews now preserve the production `/habitat-sim/` base path instead of serving the shell with unresolved repository-subpath assets.

## 1.0.0 - 2026-07-17

### Added

- Deterministic single-planet habitability and life-evolution simulation.
- Coupled star, orbit, atmosphere, surface, interior, chemistry, lineage, and ecology systems.
- Origin-of-life protocols, custom parameters, and scheduled interventions.
- Lineage structures, capabilities, trophic roles, food webs, and causal history.
- Versioned local save, import, and export workflows.
- Desktop and mobile browser coverage, production build validation, and recovery tooling.

### Changed

- Promoted the project from minimum viable prototype to public production release.
- Added the Habitat Sim Attribution-Required Non-Commercial License with required attribution to Matt Bateman.
