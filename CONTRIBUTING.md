# Contributing

Contributions that improve correctness, accessibility, performance, testing, or scientific transparency are welcome.

## Before opening a change

1. Open an issue describing the problem or proposed behavior.
2. Keep scientific assumptions explicit and label behavior as grounded, coarse, or speculative.
3. Do not present simulation output as established prediction.
4. Preserve deterministic replay for identical seeds, parameters, and interventions.
5. Report vulnerabilities privately through [SECURITY.md](SECURITY.md).

## Local checks

```sh
npm ci
npm run check
npm run test:browser
```

Changes must include appropriate tests and documentation. Major modifications must also be recorded in `CHANGELOG.md` as required by the license.

## Pull request expectations

- Keep model assumptions explicit and cite primary scientific sources when introducing a factual constant or relationship.
- Preserve the fixed simulation order, bounded inputs, immutable built-in scenarios, and user-owned preset semantics.
- Add deterministic unit coverage for model changes and browser coverage for affected user flows.
- Keep ensemble results framed as outcomes of this model, not calibrated probabilities for nature.
- Preserve keyboard access, responsive layouts, readable diagnostics, and the documented asset budgets.
- Do not commit user presets, exported experiments, credentials, generated captures outside documented audit sets, or test artifacts.
- Update architecture, science, validation, and user-facing documentation when their described behavior changes.
- List the checks run and any residual uncertainty in the pull request.

## License

By contributing, you agree that your contribution is distributed under the repository's Attribution-Required Non-Commercial License. Attribution to Matt Bateman, the Habitat Sim project name, and the source repository must remain visible.
