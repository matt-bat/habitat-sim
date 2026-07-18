# Governance Artifact: HABITAT-WIZARD-003

- `created_at_utc`: 2026-07-17T20:49:19.651626+00:00
- `project_id`: habitat-sim
- `profile`: production
- `project_language`: TypeScript
- `project_description_max4`: Planetary life evolution sandbox
- `model_runs_test_build_default`: yes
- `execution_scope`: deployment
- `deployment_requested`: true
- `execution_skill`: pseudo-agentic-automation
- `selected_mode`: critical
- `total_score`: 10
- `recommendation`: no-go

## Scores
- `data_impact`: 1
- `business_impact`: 3
- `change_complexity`: 3
- `dependency_uncertainty`: 2
- `recoverability`: 1

## Critical Overrides
- `production_security_or_runtime_boundary_change`

## Required Gates
- [x] `order-of-operations` (status: pass)
- [x] `project-backup` (status: pass)
- [x] `restore-drill` (status: pass)
- [ ] `pseudo-agentic-automation` (status: pending)
- [x] `regression-prevention` (status: pass)
- [x] `token-reduction` (status: pass)
- [x] `doc-maintenance` (status: pass)

## Startup Declaration
### Skills In Use
- `process-budget-controller`
- `token-reduction`
- `order-of-operations`
- `skill-governance`
- `requirement-clarifier`
- `thoroughly-rate-review`
- `interdependent-change-planning`
- `thoughtful-approach`
- `ui-design-skills`
- `ui-spatial-canvas`
- `regression-prevention`
- `effective-testing-methods`
- `pseudo-agentic-automation`
- `project-backup`
- `restore-drill`
- `doc-maintenance`
- `user-instructions-tracker`
- `governance-enforcement`
### Skill Selection Rationale
Critical public scientific product expansion requires multidisciplinary review, reversible persistence, adaptive UX, full responsive browser evidence, recovery, deployment, and durable documentation.
### Skill Execution Order
- `process-budget-controller`
- `token-reduction`
- `order-of-operations`
- `skill-governance`
- `project-backup`
- `restore-drill`
- `requirement-clarifier`
- `thoroughly-rate-review`
- `user-instructions-tracker`
- `interdependent-change-planning`
- `thoughtful-approach`
- `ui-design-skills`
- `ui-spatial-canvas`
- `regression-prevention`
- `effective-testing-methods`
- `pseudo-agentic-automation`
- `doc-maintenance`
- `governance-enforcement`

## Evidence Requirements
- [ ] mode + score
- [ ] impact map
- [ ] validation scope by layer
- [ ] residual risks
- [ ] backup artifact + integrity evidence
- [ ] restore freshness/pass status
- [ ] rollback plan
- [ ] release decision

## Break Glass
- enabled: false

## Notes
Stacked review, implementation, adaptive guidance, 27 tests, 20 browser runs, 688 responsive captures, dependency audit, backup, isolated restore, and synchronized release documentation pass. Release remains no-go only until the exact commit is pushed, deployed through GitHub Pages, and verified live.
