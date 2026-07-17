# Artifact Budgets

| Artifact | Hard item cap | Entry cap | Pruning rule |
|---|---:|---:|---|
| `docs/chat-history-summary.md` | 10 rows | 3 sentences | Refresh matches; remove oldest low-value row |
| `docs/chat-history-index.md` | 40 rows | 40 words | Merge superseded decisions before pruning |
| `user-instructions.md` notes | Unbounded directives, bounded notes | 25 words | Preserve directive lineage; shorten stale notes |
| Timeline in a saved experiment | 500 events | 1,500 characters detail | Preserve milestones and interventions; coalesce routine ticks |
| Snapshots in a saved experiment | 120 snapshots | Summary-only | Retain milestones plus evenly sampled history |

Canonical product history lives in the experiment timeline. Chat artifacts are coordination aids, never a substitute for product state.

