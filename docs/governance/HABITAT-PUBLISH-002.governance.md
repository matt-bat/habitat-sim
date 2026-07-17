# Governance Artifact: HABITAT-PUBLISH-002

- `created_at_utc`: 2026-07-17T16:55:34.728328+00:00
- `project_id`: habitat-sim
- `profile`: production
- `project_language`: TypeScript
- `project_description_max4`: Planetary life evolution sandbox
- `model_runs_test_build_default`: yes
- `execution_scope`: deployment
- `deployment_requested`: true
- `execution_skill`: scripted-command-execution
- `quizme_mode`: off
- `quizme_multiple_choice`: false
- `quizme_one_at_a_time`: false
- `quizme_confirm`: false
- `quizme_record`: false
- `selected_mode`: standard
- `total_score`: 4
- `recommendation`: go

## Scores
- `data_impact`: 0
- `business_impact`: 2
- `change_complexity`: 1
- `dependency_uncertainty`: 1
- `recoverability`: 0

## Critical Overrides
- none

## Required Gates
- [x] `order-of-operations` (status: pass)
- [x] `scripted-command-execution` (status: pass)
- [x] `regression-prevention` (status: pass)
- [x] `token-reduction` (status: pass)
- [x] `doc-maintenance` (status: pass)

## Startup Declaration
### Skills In Use
- `token-reduction`
- `order-of-operations`
- `process-budget-controller`
- `skill-governance`
- `governance-enforcement`
- `regression-prevention`
- `scripted-command-execution`
- `doc-maintenance`
- `user-instructions-tracker`
### Skill Selection Rationale
Public source release requires bounded governance, exact-commit regression validation, deterministic Git execution, metadata synchronization, and directive evidence.
### Skill Execution Order
- `token-reduction`
- `process-budget-controller`
- `skill-governance`
- `order-of-operations`
- `user-instructions-tracker`
- `doc-maintenance`
- `regression-prevention`
- `scripted-command-execution`
- `governance-enforcement`

## Evidence Requirements
- [x] mode + score
- [x] impact map
- [x] validation scope by layer
- [x] residual risks

## Break Glass
- enabled: false

## Notes
User explicitly requested a Git push with complete project and commit metadata. Exact-tree evidence: strict TypeScript, 12 unit/integration tests, production build, 8 desktop/mobile browser flows, zero known dependency vulnerabilities, clean diff check, complete Matt Bateman Git/package metadata, and fresh verified backup/restore evidence from HABITAT-SCIENCE-UI-001. Residual risk is limited to remote authentication and continuous integration execution after push.
