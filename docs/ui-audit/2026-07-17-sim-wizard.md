# Five-Resolution Sim Wizard Interface Audit — 2026-07-17

## Audit Method

The production build was exercised in isolated Chromium contexts with dark color scheme, reduced motion, a fixed clock, deterministic seed, two-frame paint settling, and fresh browser-local storage per profile. The harness captured the visible viewport plus top, middle, and bottom positions for every overflowing content surface. Every image has a SHA-256 hash and associated measurements for root width, critical-panel overflow, focused-element bounds, viewport size, and browser console/page errors.

The audit covers 44 canonical states:

- Six sterile root workspaces and three living root workspaces.
- Lab expert editing, custom material cargo, running snapshots, and invalid-import feedback.
- All seven default Wizard steps.
- Earth, origin, experimental, empty-user, and populated-user preset libraries.
- Single, binary, triple, invalid stellar, and adaptive science-note states.
- Element, atmosphere, pre-life oxygen, origin-protocol, and contextual-help states.
- Empty, populated, and explicitly speculative intervention plans.
- Ready, multi-star caveat, outside-model blocked, and outside-model acknowledged reviews.
- User preset save, duplicate, delete confirmation, undo, and restore states.

## Viewport Matrix

| Profile | Resolution | Aspect/use | Captures |
|---|---:|---|---:|
| Wide desktop | 1920 × 1080 | 16:9 workstation | 60 |
| Laptop | 1440 × 900 | 16:10 laptop | 74 |
| Compact desktop | 1280 × 800 | compact 16:10 | 94 |
| Tablet | 768 × 1024 | portrait tablet | 106 |
| Mobile | 390 × 844 | modern phone | 118 |
| **Full matrix** | **five profiles** | **44 canonical states** | **452** |

A corrected mobile-only sweep added 118 further captures after the final intrinsic-width fix. A second 118-capture mobile sweep then verified the final copy and exact `/habitat-sim/` Pages-form bundle. Effective inspected evidence: **688 full-state/depth screenshots**.

## Public Pages Verification

After deployment, the same 44-state matrix ran twice against `https://matt-bat.github.io/habitat-sim/`, adding 904 hosted captures. The second public sweep excluded only elements that computed to hidden, non-displayed, or zero-area boxes and promoted more than one pixel of horizontal overflow in every visible tracked panel to a hard failure. It passed all 452 captures with:

- zero root or visible-panel overflow failures;
- zero focused controls outside the viewport;
- zero console or page errors;
- all five profiles and all 44 canonical scenes complete;
- public application shell and both hashed build assets returning HTTP 200.

Total iterative interface evidence: **1,592 screenshots**.

## Iteration Findings

| Finding | Severity | Change | Recheck |
|---|---|---|---|
| Hidden desktop step rail still occupied about 360 pixels vertically on phone/tablet | critical | Removed the rail from layout below 1120 pixels and added geometry assertions for every step | pass |
| Stale transient toasts contaminated later library captures | moderate | Added deterministic toast settle before dependent scenes | pass |
| Impact Lens opened on an unrelated orbit field after changing Wizard domains | moderate | Added step-specific causal focus defaults | pass |
| Outside-model review said “ready” before acknowledgement | high | Added blocked status, disabled launch treatment, and explicit checkbox gate | pass |
| Scenario, delete, and science-note buttons fell below the preferred mobile target size | high | Enforced 44 CSS-pixel minimum Wizard and mobile application targets | pass |
| Long model-limit status created 12 pixels of internal mobile overflow | moderate | Removed intrinsic `max-content` width, allowed safe wrapping, and shortened the status | pass; corrected mobile sweep has zero tracked-panel overflow |
| Delivery/panspermia appeared beside local abiogenesis mechanisms | science/UX | Split into a clearly titled delivery and relocation overlay section | pass |

## Weighted Interface Score

| Category | Weight | Multiple checks | Rating | Weighted |
|---|---:|---|---:|---:|
| Bespoke visual hierarchy | 18 | identity; information density; primary focus; typography; state contrast | 98 | 17.64 |
| Task flow and error prevention | 18 | progressive setup; reversible navigation; ownership; blockers; destructive recovery | 97 | 17.46 |
| Responsive adaptation | 17 | five profiles; internal depth; no root overflow; corrected zero panel overflow; sticky action reachability | 99 | 16.83 |
| Scientific communication | 16 | evidence tags; provenance; causal guidance; caveats; delivery/mechanism distinction; model-disable state | 97 | 15.52 |
| Accessibility | 13 | semantic controls; accessible names; focus bounds; keyboard popovers; reduced motion; 44-pixel mobile targets; non-color cues | 94 | 12.22 |
| State and component completeness | 10 | 44 states; sterile/living; errors; confirmations; help; all roots and Wizard steps | 99 | 9.90 |
| Runtime and visual robustness | 8 | zero console errors; hashes; stable production bundle; fixed-frame desktop; reachable mobile | 97 | 7.76 |
| **Total** | **100** |  |  | **97.33 / 100** |

## Result and Remaining Risk

The deployed interface passes the production visual gate. It is recognizably designed for planetary-life experimentation rather than adapted from a generic dashboard: the causal systems ribbon, cutaway world, orbit/climate instrumentation, reaction console, gate matrix, ecosystem topology, lineage energy ledger, adaptive Impact Lens, and causal launch review all reinforce the model.

Remaining risk is limited to dedicated assistive-technology sessions, browser engines beyond Chromium, extreme user font scaling, and very low-end GPU performance. No required view, state, action, or configured screen class is unreachable in the audited matrix.
