# Contributing

Contributions that improve correctness, accessibility, performance, testing, or scientific transparency are welcome.

## Before opening a change

1. Open an issue describing the problem or proposed behavior.
2. Keep scientific assumptions explicit and label behavior as grounded, coarse, or speculative.
3. Do not present simulation output as established prediction.
4. Preserve deterministic replay for identical seeds, parameters, and interventions.

## Local checks

```sh
npm ci
npm run check
npm run test:browser
```

Changes must include appropriate tests and documentation. Major modifications must also be recorded in `CHANGELOG.md` as required by the license.

## License

By contributing, you agree that your contribution is distributed under the repository's Attribution-Required Non-Commercial License. Attribution to Matt Bateman, the Habitat Sim project name, and the source repository must remain visible.
