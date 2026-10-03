# Final lifecycle design: observed updates and subscription churn

Actual production now uses explicit COLD lifecycle state, separate mutable/computed update functions, one common getter refresh path, a separate dormant validation loop, and a small link function that reuses attached dependencies before entering its slower helper. The public get function stays stable across lifecycle transitions. This phase prioritizes stable observed updates: depth 8/32 chains are now 3.9%/2.8% slower than main, and the diamond is 5.3% slower, while improving 16.7%/18.6%/15.6% over the previous implementation. The measured tradeoffs are dormant depth-128 updates +11.1%, unchanged-source churn +11.7%, and source-write churn +8.1% versus the previous implementation. It is not universally faster.

The following measurements cover the final integrated source after comments, formatting, documentation and full correctness validation. Its minified runtime and all three consumer bundle hashes exactly match the selected prototype; comment changes did not alter shipped code.

- **Production:** atom SHA256 `0785dbd35551b206edb243eaabdba32b72e9c18803625e917f8f7e96501c8f2b`; alien SHA256 `df98cfad925f14ef265103baec02f9c558e568d76908cb626be884990bf5fa52`.
- **Previous/control:** atom `ddd453ae9d78dcf8c4da0d6ca9bcf21437fdbfafdd82c97caa8e320765a1fe81`; alien `db042f5946f4fcded249d726389b311d6a402ef9298fc769d9a1911fb72df8ed`.
- **Main:** verified upstream `a9cf2324b4a24a8190ed7981c3be1594e0446872` (2026-09-29 version-packages commit). Every core source hash matches the earlier `e06c28cbdf3514c4edd5dfc29c4d05e396363605` baseline. [Read-only verification record](results/upstream-main-verification.json).
- **PR:** exact #373 head `a7cc518cdbbd9ae7d6c60ed579bfaec42c7bce34`.

## Stable observed workloads and current-main churn

Nanoseconds per workload iteration, seven rotated sequential trials. Positive deltas mean final production is slower. “Previous” is the fixed control above, measured in the same run. Raw reports preserve every sample and quartiles as well as both variants' spreads.

| Workload                                    | Main ns |   PR ns | Previous ns | Production ns | vs main | vs previous | Production min–max ns |
| ------------------------------------------- | ------: | ------: | ----------: | ------------: | ------: | ----------: | --------------------: |
| Plain mutable read (tiny)                   |    2.26 |    2.23 |        2.23 |          2.21 |   -2.2% |       -0.9% |             2.16–2.25 |
| Plain mutable write                         |    8.83 |    9.30 |        9.73 |          6.46 |  -26.8% |      -33.6% |             6.34–6.66 |
| Mutable subscriber + callback snapshot get  |   42.44 |   45.85 |       44.73 |         39.49 |   -6.9% |      -11.7% |           37.17–41.78 |
| Observed chain depth 1                      |   70.99 |   80.74 |       80.96 |         69.27 |   -2.4% |      -14.4% |           67.89–72.35 |
| Observed chain depth 8                      |  247.59 |  292.35 |      308.99 |        257.27 |   +3.9% |      -16.7% |         255.53–266.80 |
| Observed chain depth 32                     |  890.26 | 1006.75 |     1123.53 |        914.87 |   +2.8% |      -18.6% |         902.33–922.82 |
| Chain 8 after cold read + subscribe         |  247.68 |  297.85 |      308.13 |        259.65 |   +4.8% |      -15.7% |         256.27–267.80 |
| Chain 8, three writes per batch             |  308.40 |  361.09 |      380.50 |        304.51 |   -1.3% |      -20.0% |         299.65–320.20 |
| One computed, 64 numerical operations       |  687.21 |  660.07 |      664.68 |        641.34 |   -6.7% |       -3.5% |         634.44–685.70 |
| Observed cached chain 8 get (tiny)          |    3.29 |    8.32 |        7.29 |          4.58 |  +39.3% |      -37.2% |             4.50–4.80 |
| Observed fanout 8                           |  453.39 |  534.43 |      516.99 |        480.03 |   +5.9% |       -7.1% |         470.83–515.61 |
| Observed diamond 8                          |  351.02 |  444.20 |      437.65 |        369.54 |   +5.3% |      -15.6% |         363.86–407.65 |
| Equality suppresses computed notification   |   48.08 |   52.98 |       53.48 |         44.95 |   -6.5% |      -16.0% |           44.06–46.88 |
| Chain 8 churn, unchanged source             |  448.49 |  297.76 |      306.14 |        342.02 |  -23.7% |      +11.7% |         334.10–350.45 |
| Chain 8 churn, source write while unmounted |  469.37 |  515.94 |      504.39 |        545.00 |  +16.1% |       +8.1% |         521.08–559.04 |

The phase gain and the remaining main overhead are different comparisons. For example, the observed chain-8 update improves from 308.99 to 257.27 ns (16.7% faster than previous), while main is 247.59 ns (production 3.9% slower). Production is also 12.0% faster than the original PR on that workload. Direct mutable subscribers with a callback snapshot read improve to 39.49 ns versus main 42.44 ns and previous 44.73 ns. The 64-operation getter has visibly wider main samples; its median is not evidence of a universal application speedup.

Subscription churn depends on the source while unmounted. With an unchanged source, final production is **23.7% faster than current main** (342.02 versus 448.49 ns), because dormant snapshots survive resubscription. It is **11.7% slower than previous** and 14.9% slower than the original PR. If the source changes between subscriptions, production is **16.1% slower than main** (545.00 versus 469.37 ns), **8.1% slower than previous**, and 5.6% slower than the PR. Faster unchanged-source churn does not cancel that regression or the remaining steady graph overhead. The older 21.8%/30.3% churn figures used earlier implementations or timing windows and are historical.

Repeated clean observed reads are 4.58 ns versus main 3.29 ns: the percentage is large but the absolute difference is 1.29 ns. Plain reads and all several-nanosecond cases should be interpreted with that scale in mind. No workload measures React rendering or end-user latency.

## Dormant reads, creation and retention

Seven rounds with 5× the original retention-worker iterations:

| Workload                                  | Main ns |     PR ns | Previous ns | Production ns | vs main | vs previous | Production min–max ns |
| ----------------------------------------- | ------: | --------: | ----------: | ------------: | ------: | ----------: | --------------------: |
| Dormant cached chain 8 get (tiny)         |    3.67 |     12.13 |        8.52 |          5.83 |  +59.1% |      -31.6% |             5.50–6.07 |
| Create/read/discard, fresh root every 256 |   59.97 |     94.75 |       76.88 |         85.15 |  +42.0% |      +10.8% |          55.44–101.94 |
| Dormant chain 128, write + read           | 3370.66 | 262075.52 |     5836.26 |       6481.85 |  +92.3% |      +11.1% |       5738.51–6792.38 |

Depth-128 dormant write/read is **6.48 µs**, **40.4× faster than the PR's 262.08 µs**, while taking 1.92× the leaking main implementation. It is 11.1% slower than previous (5.84 µs); their sample ranges overlap. Cached dormant reads improve from 8.52 to 5.83 ns. Create/read/discard is 85.15 ns versus previous 76.88 ns and main 59.97 ns. Allocation samples span 55.44–101.94 ns and remain unstable, so this is a recorded cost requiring application-level confirmation, not a robust precise allocation-regression estimate. The fresh-root-every-256 policy bounds main's accumulating leak during that timing case.

The deterministic graph work remains linear. For a warmed relevant write and final dormant read, the PR performs d(d+1)/2 link and unlink calls: **36, 528, 8256** at depths 8, 32, 128, with that many reverse reattachments and detachments. Production performs **8, 32, 128** forward link calls, **zero** unlink/reverse reconnect operations and **zero** warmed Link allocations. At depth 128, production records 257 atom.get() calls and 129 updates (128 user computations plus the source update); PR records 8385 atom.get() calls with the same 129 updates. These are method-call counts, not quadratic user-getter execution.

The separately instrumented harness now asserts injection sites for link, unlink, Link allocation, both public getter forms and both updater forms, so constructor specialization cannot silently produce zero update counts. It also asserts depth+1 relevant updates and one unrelated mutable update. Alternating a.get()/b.get() 1000 times retains **two dependency records**, initially allocates two Links and allocates zero on a warmed recomputation.

All three independent forced-GC trials collect every abandoned never-observed production computation: **0/100 and 0/4000 survivors**, with zero root reverse links. Main retains 100/100 and 4000/4000; PR and previous also collect all. Production source writes after 4000 abandoned reads have per-process medians 17.21–18.08 ns, versus main 19.95–23.65 µs. Explicit unsubscribe leaves 0/100 survivors in every variant; discarding an active handle without unsubscribe leaves 100/100 in every variant. Reachability evidence does not predict natural GC frequency or total application memory.

## Consumer size

Bytes are minified / gzip / Brotli, from actual tree-shaken consumer entries:

| Entry         |               Main |                 PR |           Previous |         Production |
| ------------- | -----------------: | -----------------: | -----------------: | -----------------: |
| createAtom    | 3661 / 1504 / 1403 | 4311 / 1754 / 1630 | 4594 / 1863 / 1733 | 4815 / 1924 / 1789 |
| fullStore     | 5353 / 2077 / 1939 | 6005 / 2331 / 2158 | 6290 / 2440 / 2263 | 6511 / 2494 / 2321 |
| reactSelector | 3978 / 1661 / 1543 | 4628 / 1917 / 1774 | 4911 / 2022 / 1870 | 5132 / 2082 / 1928 |

Final createAtom is **1924 gzip bytes**, adding 61 over previous and 170 over the PR. This is the starting point for the next gzip phase; size was recorded rather than optimized here. React and the external-store selector shim remain external in the adapter entry. These are incremental library costs, not complete applications.

## Attribution and rejected paths

Stable public-get reader dispatch, full cold-get helpers, a clean-flags fast return, and a cleanup-boundary rewrite were screened and rejected for mixed hot/cold costs or public-behavior regressions. The clean-flags screen brought chains close to main but left a roughly 22% diamond gap; full cold helpers added 25–48% dormant-chain overhead in their short screens. The selected small linker extraction improved the remaining diamond path without changing retained-link semantics.

Controlled main variants with initialized metadata, and metadata plus revision/epoch increments, did not reproduce the real candidate's diamond gap: main 337.06 ns, metadata 337.03 ns, revisions 337.69 ns, candidate 381.69 ns in that three-round screen. This points toward shared getter/link code layout rather than counters alone as the dominant residual cause in that experiment. It does not prove zero metadata or epoch cost: the minifier retained the unused diagnostic epoch increment, but V8 may eliminate work whose result cannot be observed. No profiler-based attribution or browser-engine confirmation was performed. Diagnostic variants retain main's leak and were never eligible for integration.

## Methodology and reproduction

Node v25.8.1/V8, Apple M3 Max, macOS arm64, esbuild 0.27.7. Minified ES2022 ESM runtime bundles; browser ESM consumer bundles use gzip level 9/Brotli quality 11. Variants run sequentially in isolated workers with order rotated across seven rounds. Each case has two full warmups on fresh graphs; setup, cleanup, assertions and forced GC are excluded. A separate instrumented preflight checks values, getter calls and notifications. Timed getters contain no counters. Final production hot samples last 11.0–102.9 ms.

Cases cover direct mutable subscribers, initial cold read then subscribe, stable subscriptions, chain depths, fanout, diamond, batching, equality suppression, repeated snapshot reads, and both churn modes. Main recomputes one extra final unmounted chain read in the source-write churn case; preflight records that legitimate difference. The arithmetic getter adds modest work rather than simulating an application. Min/max and quartiles are sample spread, not confidence intervals. Results are from one Node/V8 machine, not browser/V8, JavaScriptCore, Firefox, React rendering, or an application trace. Percentages from earlier windows should not be merged as one precise estimate.

Run future work against committed HEAD and the worktree without requiring an old PR object:

```sh
node scripts/retention-bench/prepare.mjs /tmp/store-hot main=HEAD production=.
BENCH_SUITE=hot node scripts/retention-bench/run.mjs /tmp/store-hot
BENCH_MULTIPLIER=5 BENCH_CASES=unobserved_chain8_cached_get,unobserved_chain128_write_read,create_read_discard node scripts/retention-bench/run.mjs /tmp/store-hot
node scripts/retention-bench/count-operations.mjs /tmp/store-hot
node scripts/retention-bench/retention.mjs /tmp/store-hot
```

The second runtime command replaces runtime-results.json; preserve the hot report first when running both suites. The exact final comparison used main and PR refs above, the frozen previous source, and production=.; the manifest preserves refs, portable snapshot paths and every source/bundle SHA256. Historical Git objects must be present locally before an exact replay.

## Evidence

- [Final source and consumer bundle hashes/sizes](results/lifecycle-final/manifest.json)
- [Final seven-round hot samples, preflight checks and quartiles](results/lifecycle-final/runtime-results.json)
- [Final seven-round cold/allocation guards](results/lifecycle-final/cold-guard-results.json)
- [Final exact graph work and asserted injection sites](results/lifecycle-final/operation-counts.json)
- [Final three-process forced-GC/source-write trials](results/lifecycle-final/retention-results.json)
- [Final harness SHA256 map](results/lifecycle-final/harness-hashes.json)
- [Independent final correctness/toolchain validation](results/implementation-validation.json)
- [Controlled attribution screen](results/lifecycle-attribution/runtime-results.json)
- [Selected linker extraction screen](results/lifecycle-link-helper/runtime-results.json)
- [Historical previous-implementation hot report data](results/hot-broad/runtime-results.json)

The old 1863-byte production size and earlier hot-path percentages describe the previous implementation. README's older integrated tables are also explicitly historical. Rejected sources, exploratory tests, prior prose and frozen source snapshots remain in ignored .cache/retention-research; their refs and hashes remain in public JSON. No commits, pushes or PR changes were made.
