# Governance Artifact: HABITAT-SCIENCE-UI-001

- `created_at_utc`: 2026-07-17T16:00:20.824964+00:00
- `project_id`: habitat-sim
- `profile`: production
- `project_language`: TypeScript
- `project_description_max4`: Planetary life evolution sandbox
- `model_runs_test_build_default`: yes
- `execution_scope`: local_only
- `deployment_requested`: false
- `execution_skill`: pseudo-agentic-automation
- `quizme_mode`: off
- `quizme_multiple_choice`: false
- `quizme_one_at_a_time`: false
- `quizme_confirm`: false
- `quizme_record`: false
- `selected_mode`: critical
- `total_score`: 9
- `recommendation`: go

## Scores
- `data_impact`: 1
- `business_impact`: 2
- `change_complexity`: 3
- `dependency_uncertainty`: 2
- `recoverability`: 1

## Critical Overrides
- none

## Required Gates
- [x] `order-of-operations` (status: pass)
- [x] `project-backup` (status: pass)
- [x] `restore-drill` (status: pass)
- [x] `pseudo-agentic-automation` (status: pass)
- [x] `regression-prevention` (status: pass)
- [x] `token-reduction` (status: pass)
- [x] `doc-maintenance` (status: pass)

## Startup Declaration
### Skills In Use
- `token-reduction`
- `process-budget-controller`
- `skill-governance`
- `order-of-operations`
- `interdependent-change-planning`
- `thoughtful-approach`
- `thoroughly-rate-review`
- `ui-design-skills`
- `ui-spatial-canvas`
- `pseudo-agentic-automation`
- `diagnose-before-fix`
- `project-backup`
- `restore-drill`
- `regression-prevention`
- `effective-testing-methods`
- `scripted-command-execution`
- `doc-maintenance`
- `user-instructions-tracker`
### Skill Selection Rationale
Production scientific and interface expansion requires expert review, visual evidence, recovery, regression, browser, documentation, and directive tracking gates.
### Skill Execution Order
- `token-reduction`
- `process-budget-controller`
- `skill-governance`
- `order-of-operations`
- `project-backup`
- `restore-drill`
- `thoroughly-rate-review`
- `pseudo-agentic-automation`
- `interdependent-change-planning`
- `thoughtful-approach`
- `ui-design-skills`
- `ui-spatial-canvas`
- `diagnose-before-fix`
- `regression-prevention`
- `effective-testing-methods`
- `scripted-command-execution`
- `doc-maintenance`
- `user-instructions-tracker`

## Evidence Requirements
- [x] mode + score
- [x] impact map
- [x] validation scope by layer
- [x] residual risks
- [x] backup artifact + integrity evidence
- [x] restore freshness/pass status
- [x] rollback plan
- [x] release decision

## Break Glass
- enabled: false

## Notes
All required gates pass. Evidence: 12 unit/integration tests, 8 desktop/mobile browser flows, a 12-view screenshot audit scoring 91.7/100, zero known dependency vulnerabilities, and a verified post-change backup/isolated restore. Residual risk is dedicated assistive-technology and non-Chromium engine coverage. No hosted deployment or push was requested in this local-only iteration.
