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
| Accessibility | pass (automated) | Semantic controls, keyboard-focusable scroll regions, reduced motion, labels, non-color tags, and axe-core WCAG A/AA scans pass across 65 root/Wizard scenes; manual screen-reader sessions remain a separate assurance layer |
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

Seventy browser checks cover five engine/device profiles: desktop Chromium, Pixel 7 Chromium, desktop Firefox, desktop WebKit, and iPhone 15 WebKit. Automated accessibility scans cover all six root workspaces and seven Wizard steps in each profile. The final local audit covers 44 canonical product states at 1920 × 1080, 1440 × 900, 1280 × 800, 768 × 1024, 390 × 844, and the WCAG reflow width of 320 × 568; 570 captures passed with no root or tracked-panel overflow. The full 118-capture 320-pixel profile then passed again against the deployed public application. Earlier local and public evidence remains recorded in `docs/ui-audit/2026-07-17-sim-wizard.md`; the new cross-engine gate is in `docs/ui-audit/2026-07-18-compatibility.md`. Remaining risk is limited to manual assistive-technology sessions, unusual browser/operating-system font substitution, and very low-end graphics hardware—not basic responsive reachability or engine compatibility.
