# Protoverse Lab Source Review

Review mode: deep  
Reviewed: application, simulation engine, shaders/render loop, styles, tests, build configuration, performance notes, deployment notes, and release checklist.

## Executive Assessment

Protoverse Lab is a strong interactive concept demonstrator with deterministic runs, good visual feedback, careful browser-frame budgeting, practical local persistence, and unusually honest “conceptual model” language. Its architecture is suitable as interaction inspiration for Habitat Sim, but its scientific engine should not be reused: most state variables are dimensionless heuristics, one particle object carries too many meanings, and biological emergence is represented by a single probability-weighted habitability increment.

Final score: **77.6 / 100**

## Weighted Framework

| Category | Weight | Score | Weighted contribution | Evidence |
|---|---:|---:|---:|---|
| Coverage and completeness | 14% | 88% | 12.3 | Setup, simulation, visualization, presets, metrics, persistence, import/export, timeline, documentation, and tests are present. |
| Correctness and internal consistency | 18% | 64% | 11.5 | Deterministic seeded state and normalization are sound; scientific labels frequently map to invented dimensionless rules. |
| Practical utility and end-user value | 14% | 86% | 12.0 | Fast experimentation, readable outcomes, camera controls, presets, tooltips, and saved seeds support exploration well. |
| Safety, risk control, and reliability | 14% | 80% | 11.2 | Import size caps, sanitization, confirmation for deletes, bounded libraries/events, stable-step caps, and recovery notes are present. |
| Enforceability and operationalization | 14% | 74% | 10.4 | Type, unit, build, smoke, release, and manual checks exist; browser coverage is a standalone smoke script rather than behavior-rich tests. |
| Clarity and documentation quality | 10% | 82% | 8.2 | README and operational docs are clear and candid; architecture and model-variable provenance are not documented deeply. |
| Efficiency and maintainability | 6% | 72% | 4.3 | Grid/buffer caches and render sampling are thoughtful; the main thread and two very large source files constrain growth. |
| Integration and cohesiveness | 10% | 76% | 7.6 | Engine, rendering, UI, metrics, and persistence align, but the event/life model is not deep enough to support the product narrative. |

### Category Checks (0–5)

| Category | Concrete checks and scores | Raw score |
|---|---|---:|
| Coverage | Core workflows 4.5; experiment persistence 4.5; operational/test surfaces 4.2 | 88% |
| Correctness | Deterministic mechanics 3.5; scientific fidelity 3.0; state/label consistency 3.1 | 64% |
| Utility | Setup discoverability 4.5; feedback and comparison 4.3; recovery/export value 4.1 | 86% |
| Safety and reliability | Input bounds 4.2; runtime stability controls 3.9; destructive/recovery safeguards 3.9 | 80% |
| Operationalization | Automated commands 3.8; behavior coverage 3.7; release evidence 3.6 | 74% |
| Documentation | Onboarding 4.3; limitations 4.2; architecture/model provenance 3.8 | 82% |
| Efficiency | Frame budgeting 3.9; source modularity 3.4; scaling path 3.5 | 72% |
| Integration | Cross-surface alignment 4.0; sequencing compatibility 3.8; policy/runtime consistency 3.6 | 76% |

Confidence: high for code and workflow quality because all first-party files were inspected; medium for runtime performance because historical measurements were reviewed but not independently rerun.

## What Should Be Reused as a Pattern

- Seed plus normalized parameters as the complete experiment identity.
- A mutable simulation object outside React state, with throttled immutable summaries for the interface.
- Frame-budgeted stepping and rendering rather than equating requested speed with achieved speed.
- Distinct live readouts for requested speed, achieved speed, and limiting cause.
- Multiple explanatory render modes and legends.
- Plain-language diagnosis alongside numeric metrics.
- Local experiment library with versioned JSON import/export and strict bounds.
- Timeline events capped and displayed newest-first.
- Honest scientific disclaimer in the primary README.

## What Must Change for Habitat Sim

1. Replace the all-purpose particle model with explicit subsystem state: star/orbit, interior, atmosphere, surface, chemistry, populations, and ecology.
2. Replace “life probability” with gated reaction opportunities and stochastic transitions driven by solvent, resources, gradients, stability, and time.
3. Store event causes and before/after state deltas, not only a title, description, and age.
4. Separate environment habitability, prebiotic readiness, inhabited state, and support for complex life.
5. Represent populations and lineages explicitly, with ancestry, traits, structures, fitness, mutation, selection, speciation, and extinction.
6. Make trophic roles emerge from resource intake and interactions.
7. Attach evidence class, uncertainty, and source notes to scientific modules.
8. Split the engine by domain instead of repeating the two-file concentration of `simulation.ts` and `App.tsx`.

## Top Strengths

- Determinism is tested directly.
- Performance tradeoffs are understood and documented.
- The UI gives both visual and textual feedback.
- The app remains useful without a backend.
- Limits are stated rather than hidden.

## Top Gaps

- Heuristic variables are presented with science-adjacent names but no calibration or provenance.
- Life and habitability are too shallow for causal biological exploration.
- Tests do not establish meaningful stage transitions, outcome diversity, or UI workflows.
- Main-thread object simulation limits scale and complicates future domain growth.
- Timeline entries cannot support historical drill-in.

## Prioritized Upgrade Path Applied to Habitat Sim

1. Domain-separated deterministic engine and documented invariants.
2. Coupled reservoir/state model with explicit uncertainty.
3. Origin experiments and intervention ledger.
4. Population genetics, structures, and ecology.
5. Drillable snapshots and causal timeline.
6. Web Worker and typed arrays only after model boundaries stabilize.
