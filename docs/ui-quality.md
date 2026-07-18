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
| System status | pass | Age, play state, rate, toast feedback, causal systems ribbon, orbital/climate regime, origin gates, gas partial pressures, ecological and lineage energy readouts |
| Real-world mental model | pass | Planet, Origins, Biosphere, Lineages, Timeline, Lab terminology |
| User control and recovery | pass | Pause, step, reset, saved experiments, JSON export, confirmed bounded imports |
| Error prevention | pass | Normalized inputs, bounded files/data, explicit speculative labels |
| Recognition over recall | pass | Six visible root controls and labeled actions; keyboard shortcuts are optional |
| Progressive disclosure | pass | Summary first, dedicated root workspaces, grouped Lab controls, and scroll-contained scientific detail |
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

Twenty desktop/mobile Chromium workflows pass. The final audit covers 44 canonical product states at 1920 × 1080, 1440 × 900, 1280 × 800, 768 × 1024, and 390 × 844. Iterative local, corrected-mobile, and two public Pages sweeps produced 1,592 captures; the final 452-image hosted sweep promoted overflow in every visible tracked panel to a hard failure and passed with no browser, focus, console, page, root-overflow, or panel-overflow defect. The weighted evidence is in `docs/ui-audit/2026-07-17-sim-wizard.md`. Remaining risk is limited to dedicated assistive-technology sessions, user-scaled typography, cross-engine rendering, and very low-end graphics hardware—not basic responsive reachability.
