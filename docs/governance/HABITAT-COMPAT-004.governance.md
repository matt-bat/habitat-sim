# Governance Artifact: HABITAT-COMPAT-004

- `created_at_utc`: 2026-07-18T03:42:35.676421+00:00
- `project_id`: habitat-sim
- `profile`: production
- `project_language`: TypeScript
- `project_description_max4`: Planetary life evolution sandbox
- `model_runs_test_build_default`: yes
- `execution_scope`: deployment
- `deployment_requested`: true
- `execution_skill`: pseudo-agentic-automation
- `quizme_mode`: off
- `selected_mode`: standard
- `total_score`: 7
- `recommendation`: no-go

## Scores
- `data_impact`: 0
- `business_impact`: 2
- `change_complexity`: 2
- `dependency_uncertainty`: 2
- `recoverability`: 1

## Critical Overrides
- none

## Required Gates
- [x] `order-of-operations` (status: pass)
- [x] `pseudo-agentic-automation` (status: pass)
- [x] `regression-prevention` (status: pass)
- [x] `token-reduction` (status: pass)
- [x] `doc-maintenance` (status: pass)

## Startup Declaration
### Skills In Use
- `process-budget-controller`
- `token-reduction`
- `order-of-operations`
- `skill-governance`
- `user-instructions-tracker`
- `regression-prevention`
- `effective-testing-methods`
- `ui-design-skills`
- `pseudo-agentic-automation`
- `doc-maintenance`
- `governance-enforcement`
### Skill Selection Rationale
Production compatibility hardening requires bounded governance, cross-engine browser automation, accessibility and runtime evidence, regression control, and synchronized documentation.
### Skill Execution Order
- `process-budget-controller`
- `token-reduction`
- `order-of-operations`
- `skill-governance`
- `governance-enforcement`
- `user-instructions-tracker`
- `regression-prevention`
- `effective-testing-methods`
- `ui-design-skills`
- `pseudo-agentic-automation`
- `doc-maintenance`

## Evidence Requirements
- [x] mode + score
- [x] impact map
- [x] validation scope by layer
- [x] residual risks

## Break Glass
- enabled: false

## Notes
All local gates pass: 27 deterministic tests, 70 five-profile browser checks, 65 automated accessibility scenes, 570 six-resolution screenshots, enforced bundle budgets, zero-vulnerability audit, and verified Pages-form assets. Recommendation remains no-go only until the requested public push, GitHub Actions run, deployment, and hosted verification complete.
