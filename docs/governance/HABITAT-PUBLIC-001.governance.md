# Governance Artifact: HABITAT-PUBLIC-001

- `created_at_utc`: 2026-07-17T15:34:01.503459+00:00
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
- `selected_mode`: critical
- `total_score`: 10
- `recommendation`: go

## Scores
- `data_impact`: 2
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
- [x] `scripted-command-execution` (status: pass)
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
- `project-backup`
- `restore-drill`
- `scripted-command-execution`
- `diagnose-before-fix`
- `regression-prevention`
- `effective-testing-methods`
- `doc-maintenance`
- `file-maintenance`
- `user-instructions-tracker`
- `governance-enforcement`
- `semantic-policy-audit`
### Skill Selection Rationale
Public production release requires licensing, recovery, regression, documentation, policy, and external publication controls.
### Skill Execution Order
- `token-reduction`
- `process-budget-controller`
- `skill-governance`
- `order-of-operations`
- `interdependent-change-planning`
- `thoughtful-approach`
- `project-backup`
- `restore-drill`
- `scripted-command-execution`
- `diagnose-before-fix`
- `regression-prevention`
- `effective-testing-methods`
- `doc-maintenance`
- `file-maintenance`
- `user-instructions-tracker`
- `governance-enforcement`
- `semantic-policy-audit`

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
User explicitly authorized full test/build iteration and publication. Clean install, audit, 8 unit/integration tests, production build, 6 desktop/mobile browser flows, post-change backup, isolated restore, hash comparison, restored clean install, and restored production build passed.
