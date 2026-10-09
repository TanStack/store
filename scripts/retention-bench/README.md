# Computed retention benchmarks

The reusable harness compares production consumer bundles, steady-state runtime, graph operation counts and garbage-collection reachability. The latest [size and performance report](SIZE.md) covers current local production, actual built-package consumers, seven-round runtime guards and retention. Current createAtom is **1866 gzip bytes through the package build**, or **1872 through the direct-source pipeline**. [HOT_PATH.md](HOT_PATH.md) and the tables below preserve earlier implementation measurements. The harness uses pinned esbuild 0.27.7. Recorded measurements used Node v25.8.1 on an Apple M3 Max, macOS arm64. Node ESM, WeakRef and exposed-GC support are required; no TypeScript loader is needed. `ESBUILD_PATH` can select another installed esbuild module directory, and metadata records its version. Keep Node and bundler versions constant when comparing results.

## Run and methodology

From the repository root, compare committed `HEAD` with the current worktree, including uncommitted production edits:

```sh
pnpm bench:retention /tmp/store-retention
```

The default comparison needs no historical PR object. Explicit `label=REF` or `label=PATH` arguments select additional variants; relative paths should begin with `.`. A path can name a worktree or a core `src` directory. Historical comparisons require the named Git objects to exist locally; fetch the corresponding branch or PR ref if they are absent.

```sh
pnpm bench:retention /tmp/store-retention-history baseline=e06c28cbdf3514c4edd5dfc29c4d05e396363605 pr=a7cc518cdbbd9ae7d6c60ed579bfaec42c7bce34 production=.
```

Keep heavy tests and other benchmarks idle during timings. `compare.mjs` runs four sequential phases: source snapshot and size preparation; runtime trials; separately instrumented operation counts; forced-GC trials. It never commits, publishes, uploads or installs dependencies.

- `prepare.mjs OUT label=REF ...` is the fast source-size command. It bundles core, React and utility browser ESM consumer exports with minification, tree shaking and ES2022, then uses gzip level 9 and Brotli quality 11. Per-module minified contributions are recorded; compressed totals are not additive. The runtime bundle is also minified ES2022 ESM, targeting Node. All source-file and generated-bundle SHA256 hashes are recorded. Reusing an output directory clears copied package sources so removed files cannot survive a later iteration.
- `size-dist.mjs OUT label=/package/dist/index.js ...` verifies consumer sizes through actual tsdown ESM package output. Core and React adapter builds must exist first. It freezes built files, applies the same consumer/minification/compression options, and records built-file and consumer hashes. This is a size-only pipeline; graph counts and runtime guards use source snapshots.
- `run.mjs OUT` rotates sequential variants across seven independent worker rounds. Each workload has two complete warmups followed by a timed fresh graph; setup, assertions, cleanup and GC are excluded. A separate 1% preflight instruments getter/callback counters and checks values and notifications. Timed production bundles and getters contain no instrumentation. `BENCH_ROUNDS`, `BENCH_MULTIPLIER` and comma-separated `BENCH_CASES` permit focused checks.
- `count-operations.mjs OUT` instruments separate source copies, never timed or sized, to count link/unlink calls, reverse connections, Link allocations, atom.get() calls and updates. It asserts injection sites and relevant update counts, and checks retained dependency records when a cold getter alternates a.get()/b.get() 1000 times.
- `retention.mjs OUT` tests three independent processes per variant, including 100 and 4000 never-observed computations, 100 explicitly unsubscribed computations and 100 subscriptions whose handles are discarded without unsubscribe. Eight forced-GC turns precede WeakRef inspection. Source-write samples and reverse-link counts are recorded.
- `save-results.mjs OUT DESTINATION [SOURCE_DESTINATION]` preserves portable JSON reports and worktree/path source snapshots. Git-ref variants retain refs and hashes. For repository reports, use an ignored source destination such as `.cache/retention-research/results/RUN/sources` to keep research TypeScript snapshots outside production checks.

The allocation workload replaces its root every 256 computations to bound the baseline leak. The observed-after-cold-read workload reads a chain while dormant, subscribes, then measures steady writes, matching a render-before-subscribe lifecycle.

## Historical implementation measurements (before the transition fix)

These historical measurements cover the integrated implementation before the later live-to-cold transition correctness fix and lifecycle hot-path redesign. For current production hashes, size and current-main comparisons, see [HOT_PATH.md](HOT_PATH.md). Source SHA256: atom `26bf5d9fbca710fc56b0a4f79d9a44266d108dec31a7c988e32ea054eed73d82`; alien `db042f5946f4fcded249d726389b311d6a402ef9298fc769d9a1911fb72df8ed`. Baseline is `e06c28cbdf3514c4edd5dfc29c4d05e396363605`; PR is exact head `a7cc518cdbbd9ae7d6c60ed579bfaec42c7bce34`; frozen proposal atom SHA256 is `c3447c86af0e93d11611efce4267046ee9f84ee327803ea640cd74c9c95a27b5`.

Bundle bytes are minified / gzip / Brotli. `createAtom` retains only that public export; `fullStore` retains all public exports; `reactSelector` retains createAtom and useSelector, with React and the external-store selector shim external. They are incremental library sizes, not complete applications.

| Entry         |           Baseline |                 PR |    Frozen proposal |         Production |
| ------------- | -----------------: | -----------------: | -----------------: | -----------------: |
| createAtom    | 3661 / 1504 / 1403 | 4311 / 1754 / 1630 | 4451 / 1808 / 1679 | 4578 / 1859 / 1727 |
| fullStore     | 5353 / 2077 / 1939 | 6005 / 2331 / 2158 | 6147 / 2386 / 2210 | 6274 / 2435 / 2256 |
| reactSelector | 3978 / 1661 / 1543 | 4628 / 1917 / 1774 | 4768 / 1971 / 1823 | 4895 / 2019 / 1869 |

Historical production createAtom was **1859 gzip bytes**, adding 51 bytes over the proposal and 105 bytes over the PR. FullStore was 2435 gzip bytes, adding 49 over the proposal and 104 over the PR. The current gzip starting point is in [HOT_PATH.md](HOT_PATH.md); this earlier implementation stage prioritized correct retention and runtime behavior.

Timing is nanoseconds per workload iteration, shown as median [minimum, maximum] across seven rounds. Each write changes the value; depth is the number of computed atoms.

| Workload                                          |                Baseline ns |                            PR ns |                Proposal ns |              Production ns |
| ------------------------------------------------- | -------------------------: | -------------------------------: | -------------------------: | -------------------------: |
| Plain read (tiny/noisy)                           |          2.36 [2.33, 4.17] |                2.40 [2.34, 4.58] |          2.40 [2.35, 2.64] |          2.37 [2.34, 2.51] |
| Plain write (tiny/noisy)                          |       10.13 [10.00, 12.85] |             10.65 [10.45, 14.15] |       11.15 [10.97, 13.68] |       11.18 [10.69, 12.34] |
| Observed chain8 write                             |    256.88 [247.49, 276.57] |          283.46 [278.65, 496.64] |    296.56 [289.97, 326.75] |    296.39 [291.50, 304.03] |
| Observed diamond8 write                           |    384.12 [379.90, 432.33] |          440.51 [425.03, 538.94] |    433.90 [423.56, 457.50] |    436.39 [427.81, 449.46] |
| Observed chain8 write after cold read + subscribe |    290.64 [266.03, 302.81] |          321.74 [319.24, 366.96] |    315.30 [295.09, 342.58] |    319.62 [308.74, 330.89] |
| Unobserved cached chain8 read                     |         3.19 [3.16, 11.07] |             11.75 [10.40, 37.54] |          8.99 [8.87, 9.54] |          9.01 [8.84, 9.67] |
| Unrelated write + cached chain8 read              |       27.41 [26.33, 29.58] |          142.05 [138.69, 156.20] |    124.31 [120.58, 130.80] |    122.58 [121.53, 126.36] |
| Unrelated write + cached fanin64 read             |       25.62 [25.14, 28.61] |          379.48 [372.76, 628.24] |    381.15 [372.39, 397.13] |    373.67 [369.75, 384.28] |
| Unobserved chain8 write + read                    |    236.23 [231.36, 254.43] |       1185.93 [1156.87, 2732.58] |    376.75 [364.94, 384.40] |    372.81 [358.37, 457.13] |
| Unobserved chain32 write + read                   |   947.43 [849.13, 1521.59] |    13850.41 [13587.75, 18962.97] | 1401.41 [1348.12, 1516.13] | 1522.87 [1413.19, 1596.49] |
| Unobserved chain128 write + read                  | 3543.99 [3178.18, 8851.17] | 246934.82 [241695.83, 266971.72] | 6250.59 [6004.29, 7013.20] | 6751.36 [6055.96, 7384.92] |
| Chain8 subscribe/unsubscribe                      |    384.01 [373.28, 420.95] |          302.98 [280.03, 425.48] |    306.64 [289.69, 346.79] |    300.30 [295.26, 325.11] |
| Create/read/discard (root replaced every 256)     |       80.12 [66.24, 96.93] |            91.42 [57.70, 108.37] |       92.20 [58.60, 99.72] |      91.62 [55.78, 134.12] |

Production preserves the proposal’s ordinary observed-write performance and removes the lazy-field regression after a cold read: 319.62 ns after cold read + subscribe versus proposal 315.30 ns and PR 321.74 ns. The rejected lazy-field integration took 456.80 ns in its full run. A focused three-round check independently measured proposal 291.2 ns, lazy 439.5 ns and initialized production 291.8 ns.

At depth 128, production cold write/read takes **6.75 µs versus PR 246.93 µs (36.6× faster)**; the leaking baseline takes 3.54 µs and the proposal 6.25 µs. Depth 32 is about 9% slower than the proposal in this run; depth 8 is effectively unchanged. Subscription churn is 300.30 ns versus proposal 306.64 ns and PR 302.98 ns. Observed chain writes are about 4.6% slower than the PR and 15.4% slower than baseline in this run. Production cold depth-128 write/read is about 1.9× baseline, despite removing the PR’s quadratic path. This is not an all-path speedup. These medians describe graph overhead, not end-user latency.

Unrelated writes still trigger cold validation (fanin64 about374 ns versus baseline 26 ns). Forced-GC and trivial-getter workloads emphasize engine costs. Some PR and baseline trials had larger outliers, visible in the reported spread and raw samples. Plain-read ratios and allocation-workload percentages should not drive decisions: both operate at short durations, and allocation trials were visibly unstable.

### Exact graph work and repeated-read retention

For one warmed relevant write + cold final read:

| Depth | PR link / unlink calls | Production link / unlink calls | PR reverse reattach / detach | Production reverse reattach / detach |
| ----- | ---------------------: | -----------------------------: | ---------------------------: | -----------------------------------: |
| 8     |                36 / 36 |                          8 / 0 |                      36 / 36 |                                0 / 0 |
| 32    |              528 / 528 |                         32 / 0 |                    528 / 528 |                                0 / 0 |
| 128   |            8256 / 8256 |                        128 / 0 |                  8256 / 8256 |                                0 / 0 |

The PR performs d(d+1)/2 link/unlink calls; production performs d forward-link calls and zero reverse reconnects. Warmed Link allocations are zero for both. Each user getter runs once per relevant write in all variants. Production atom.get() counts are 17/65/257 for depths 8/32/128; the PR counts are 45/561/8385. Those count graph-level method calls, not repeated user getter executions.

Alternating a.get()/b.get() 1000 times retains **2 dependency records and initially allocates 2 Links** in production, matching baseline/PR; the earlier proposal retains 2000 records and allocates 2000 Links. A warmed recomputation allocates 0 Links in all variants. All 2000 link-function calls still occur in production; numeric stamps avoid duplicate records without retaining subscriber references on dependencies.

### Reachability

In all three independent GC trials, production collects every abandoned never-observed computation: 0/100 and 0/4000 survivors, versus baseline 100/100 and 4000/4000. PR and proposal also collect all never-observed computations. Production has 0 reverse root links after 4000 abandoned reads; writes to that source take 20.23–20.90 ns across per-process medians, comparable to its empty-source control.

Explicit subscribe/unsubscribe leaves 0/100 survivors in every variant. Discarding active handles without unsubscribe leaves 100/100 survivors in every variant, as those subscriptions remain active. These forced-GC checks demonstrate reachability for the tested graph, not natural collection frequency or total application memory.

### Evidence and archived research

- [Final integrated bundle/source hashes](results/production-final/manifest.json)
- [Final raw runtime samples, spreads and preflight counters](results/production-final/runtime-results.json)
- [Final exact operation and dependency-record counts](results/production-final/operation-counts.json)
- [Final three-process GC/source-write trials](results/production-final/retention-results.json)
- [Final benchmark-script hashes](results/production-final/harness-hashes.json)
- [Focused consistent-shape check](results/shape-focused/runtime-results.json)
- [Rejected lazy-field integration](results/integrated-production/runtime-results.json)
- [Original frozen proposal](results/final-links/runtime-results.json)
- [Earlier transient-array candidate](results/first-array-candidate/runtime-results.json)
- [Earlier direct-collection candidate](results/direct-candidate/runtime-results.json)

All raw JSON is preserved. Local source snapshots, rejected prototype sources, exploratory test scripts and the historical prose report are preserved under ignored `.cache/retention-research`. Source refs and SHA256 maps remain in the public reports. Research snapshots are intentionally excluded from package tests and Knip’s production-file analysis; the reusable benchmark entry points are explicitly registered.

This is a single-machine Node/V8 microbenchmark with no browser/JavaScriptCore/Firefox measurements. Min/max is sample spread, not a confidence interval; gzip/Brotli changes may include minifier identifier shifts as well as source changes. The architecture conclusions also have deterministic operation-count and reachability evidence.
