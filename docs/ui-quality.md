# Interface Quality Gate

## User and Tasks

- User: science enthusiast or educator running comparative planetary-life experiments.
- Primary tasks: understand planet state, choose an origin protocol, run time, intervene, inspect ecology/lineages, and drill into history.
- Critical constraint: scientific uncertainty must remain visible without overwhelming the core flow.

## Principle Checklist

| Principle | Result | Evidence or exception |
|---|---|---|
| Clarity and hierarchy | pass | One active root view, outcome heading, compact status metrics, strong panel hierarchy |
| Consistency | pass | Shared metrics, meters, tags, titles, buttons, and root navigation |
| System status | pass | Age, play state, rate, toast feedback, orbital regime, gas partial pressures, causal bottlenecks, and biosphere readouts |
| Real-world mental model | pass | Planet, Origins, Biosphere, Lineages, Timeline, Lab terminology |
| User control and recovery | pass | Pause, step, reset, saved experiments, JSON export, confirmed bounded imports |
| Error prevention | pass | Normalized inputs, bounded files/data, explicit speculative labels |
| Recognition over recall | pass | Six visible root controls and labeled actions; keyboard shortcuts are optional |
| Progressive disclosure | pass | Summary first, detailed origins/lineages/events in dedicated root views |
| Accessibility | partial | Semantic controls, focus, reduced motion, labels, non-color tags, and desktop/mobile browser flows pass; a dedicated screen-reader and automated rules audit is still separate work |
| Responsive adaptation | pass | Fixed desktop frame and reachable mobile stacked fallback |
| Motion restraint | pass | Only slow orbit and play pulse; reduced-motion removes both |
| Content-first discipline | pass | Visual supports state; primary data and actions remain readable without animation |

## Spatial Canvas Gate

- Root tabs: pass
- One-click home anchor: pass
- Core action depth: one or two actions
- In-situ play/intervention controls: pass
- Desktop page scrollbar: none
- Exception: data-dense lists scroll inside their panel; mobile uses document scrolling so every control remains reachable.

## Remaining Risk

Desktop and mobile Chromium workflows and a complete twelve-view screenshot sweep pass. Remaining risk is limited to dedicated assistive-technology and cross-engine validation, not basic responsive reachability.
