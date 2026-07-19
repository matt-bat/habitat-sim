# Cross-Engine Accessibility and Reflow Audit

## Scope

Habitat Sim 1.1.1 closes the compatibility risks left explicit after the 1.1.0 public release. The audit covers browser-engine parity, automated accessibility, WCAG reflow width, touch geometry, performance budgets, and visual integrity across the full product-state harness.

## Browser Matrix

| Profile | Engine | Device context | Checks |
|---|---|---|---:|
| desktop-chromium | Chromium | desktop | 14 |
| mobile-chromium | Chromium | Pixel 7 | 14 |
| desktop-firefox | Firefox | desktop | 14 |
| desktop-webkit | WebKit | desktop | 14 |
| mobile-webkit | WebKit | iPhone 15 | 14 |

The 70 checks include core simulation workflows, all seven Wizard steps, preset lifecycle, reviewed launch, accessibility scans, 320-pixel root reflow, and 320-pixel Wizard reflow.

## Accessibility Gate

- axe-core scans all six root workspaces and all seven Wizard steps in every browser/device profile: 65 scene scans in total.
- Enabled standards tags are WCAG 2 A/AA, WCAG 2.1 A/AA, and WCAG 2.2 AA.
- Result: zero automated violations.
- Scrollable root workspaces are named keyboard-focusable regions.
- Citation, source, and contextual-science links retain at least 24-pixel desktop and 44-pixel mobile hit areas.
- Automated testing does not substitute for a manual screen-reader session; that is retained as an assurance boundary rather than represented as completed evidence.

## Reflow and Visual Gate

| Profile | Resolution | Captures |
|---|---:|---:|
| wide desktop | 1920 × 1080 | 60 |
| laptop | 1440 × 900 | 74 |
| compact desktop | 1280 × 800 | 94 |
| tablet | 768 × 1024 | 106 |
| mobile | 390 × 844 | 118 |
| WCAG reflow | 320 × 568 | 118 |
| **Total** | six profiles | **570** |

All 44 canonical states were captured with fixed time, reduced motion, deterministic state setup, and top/middle/bottom internal depth where content overflowed vertically. The harness treats document and every visible tracked-panel horizontal overflow as a hard failure. Result: zero failures. After deployment, the complete 320 × 568 profile was repeated against the public Pages application, adding 118 hosted captures with zero failures.

Manual spot inspection included a living ecosystem graph, sterile planetary observatory, populated Lab snapshot controls, tablet atmosphere editor, mobile launch review, and 320-pixel experimental-preset library. Hierarchy, navigation, action reachability, touch sizing, data density, and visual identity remained intact in each.

## Diagnosed Findings and Corrections

| Symptom | Verified cause | Correction | Post-fix evidence |
|---|---|---|---|
| Lab controls clipped at 320 pixels | Grid/flex descendants retained intrinsic select widths | Added explicit shrink constraints to Lab columns, field labels, and selects | Root reflow checks plus 118-capture 320 sweep pass |
| Plan seed controls clipped | Nested deterministic-seed flex row retained intrinsic width | Added shrink constraints to the label and inner row | All seven Wizard reflow checks pass |
| Source links failed target sizing | Inline links had text-only hit boxes | Added structured link boxes and mobile target expansion | All 65 accessibility scenes pass |
| Scrollable workspaces lacked keyboard access | Scroll containers were not focusable regions | Added adaptive region labels and keyboard focus | Automated root scans pass in five profiles |
| Bottom navigation exceeded 320 pixels | Six 54-pixel minimum columns plus gaps exceeded the viewport | Added an extreme-width equal-column layout with 44-pixel minimum targets | Zero rail overflow and direct target assertions pass |
| Compact World heading hit the geometry boundary | Mobile heading margin placed its box exactly at the 40-pixel threshold | Tightened the mobile title rhythm | Five-profile compact-Wizard rerun passes |

## Performance Gate

- JavaScript: 106.05 kilobytes deterministic gzip against a 120-kilobyte limit.
- CSS: 14.01 kilobytes deterministic gzip against a 20-kilobyte limit.
- The budget script fails on missing assets or any aggregate overage and runs inside `npm run check` and continuous integration.

## Decision

Pass. GitHub Actions run `29675756737`, public Pages deployment, independent hosted shell/asset verification, and the hosted 118-capture reflow sweep all pass. No known browser-engine, automated-accessibility, 320-pixel reflow, touch-target, tracked-overflow, or bundle-budget release defect remains. Manual assistive-technology and unusually constrained graphics hardware remain honest external assurance boundaries.
