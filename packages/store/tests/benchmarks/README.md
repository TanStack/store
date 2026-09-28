# Core benchmarks

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter @tanstack/store test:bench
```

To focus on a group, append `--testNamePattern=unobserved`. The dedicated
`vitest.bench.config.ts` runs only this directory in Node, with coverage and
typechecking disabled. The existing `tests/derived.bench.ts` framework comparison
is excluded; its scheduling and cleanup need normalization before comparison.

## Coverage

The 24 cases target distinct operations and graph paths, rather than every size
combination. Fan-out uses small/large endpoints; chains use depth 100. A shallow
dependency-changed read remains because direct dirty reads differ from deep pull
validation. Inactive-branch writes are checked by the branch-switch contract.

| Area                 | Cases | Measured operation                                                                                           |
| -------------------- | ----: | ------------------------------------------------------------------------------------------------------------ |
| Basic                |     5 | Atom creation and cached get; atom/Store changed writes; atom same-value write with 100 computed subscribers |
| Fan-out              |     2 | One write with 1 or 100 subscribers                                                                          |
| Observed graphs      |     4 | Depth-100 chain, diamond, 100-source fan-in, unchanged intermediate output                                   |
| Unobserved           |     6 | Depth-100 first/cached/dependency/unrelated reads; depth-1 dependency read; depth-100 dependency write       |
| Lifecycle            |     3 | Subscribe to a previously read graph, remove its last subscriber, resubscribe after an unobserved change     |
| Dynamic dependencies |     1 | Switch branches                                                                                              |
| Batching             |     2 | The same 10-source write sequence, batched and unbatched                                                     |
| Application          |     1 | 200 single-field updates across 100 field selections                                                         |

## Measurement contracts

Fixtures are constructed outside timing, except in the creation benchmark.
Steady-state fixtures persist across invocations, and changed values toggle or
cycle deterministically. First-read graphs are freshly constructed in preparation.
In the unobserved read cases, dependency and unrelated writes happen in preparation
so timing covers only the read. The separate dependency-write case starts with a
clean, already-read graph and times invalidation without a pull read. Teardown
unsubscribes every observer.

Each measured callback yields a small checksum. Assertions outside timing check
the returned value, notification count/sum, and relevant recomputation counts.
Same-value writes must avoid recomputation and notifications, while dependency
reads must recompute every level. Parity changes and untimed inactive-branch writes
must skip downstream work. Lifecycle verification checks notifications after a
write before reading the output, so verification cannot repair missing connections.

The application benchmark performs a fixed sequence in every timed invocation:
update each of 100 fields to 1, then update each back to 0. Each write changes only
one field. Subscriber callbacks record a checksum and notification field, value,
and update index into preallocated buffers. Verification requires exactly one
notification from the changed field at each step and checks all final selections.
The reported cost is for all 200 updates, including object copying and notification
bookkeeping, not for one update.

The harness uses suite hooks for CodSpeed simulation and Tinybench's public
per-iteration `Task.opts` hooks (installed by `setup`) for native Vitest. Both
runners use `setup`/`teardown` for fixture lifetime, but Vitest does not pass
per-iteration hooks through its benchmark options, and CodSpeed's simulation
runner invokes suite hooks instead. Keep both paths aligned when upgrading.
`fixtures.test.ts` also exercises each contract through four invocations in the
ordinary core test suite to cover both directions of toggles and fixture reuse.
CodSpeed simulation resets the fixture after warmup and measures one invocation;
the full application sequence is therefore timed in both local and CI runs.

Local timing is a smoke test and exploratory measurement. Very small operations
include callback/checksum overhead, and preparation can affect cache/GC behavior.
CI uses [CodSpeed CPU simulation](https://codspeed.io/docs/instruments/cpu) for
relative CPU-cost comparisons; its reported time is not browser latency.

## CI and baseline

The workflow runs on pull requests, pushes to `main`, and manual dispatch. Actions,
Node, pnpm, the CodSpeed runner, and the plugin are pinned; dependency resolution
uses the frozen lockfile. `@codspeed/vitest-plugin` is pinned to `6.0.0-beta.2`
because the stable 5.x release does not declare Vite 8 support and its native
instrumentation targets older Node releases. Version 6 supports the Node 24/Vite 8
stack used here. Revisit this pin when a compatible stable version is available.

Enable this public repository in CodSpeed to receive uploaded reports. Public
repository uploads do not need a secret token. Initially leave performance checks
non-blocking in CodSpeed/repository branch protection and collect a `main`
baseline. Configure regression thresholds after reviewing baseline results;
execution errors and failed workload assertions should still fail the workflow.
See the [Vitest integration guide](https://codspeed.io/docs/benchmarks/nodejs/vitest).
