# Bundle-size reduction and performance guard

Actual tsdown package output now gives **1866 gzip bytes for createAtom**, down **53 bytes (2.8%)** from the published PR376 build's 1919. FullStore falls 2480→2431 and the built React consumer 2137→2088 gzip bytes. These are modest core reductions. Utility-only entries save 981–1001 gzip bytes by dropping the unused reactive engine; that fixes a tree-shaking issue already present on main and is a separate benefit.

The local design retains dedicated mutable/computed update bodies, moves cold validation into a shared helper, compacts cold-link bookkeeping, uses readable internal version/runId/lastRead names, and stores the pure reactive system as an object rather than eagerly destructuring it. The computed updater occupies the object's default method; mutable atoms install their dedicated updater. Async completion logic is shared. No commits or pushes were made in this phase.

Published baseline is `451be99bfd5b9f3295b829ef18ab7dd68d32ddfe`. Exact local source SHA256: atom `70a88586c2f773107463ede53a55f5e88caccd64ea1037dc1954b80fae7c11f9`, alien `31f429d4706b58202278fb5a5dc479a0ce3273fd55f74da3e75ef9ff5272d885`, signal `6a9ce25bdb9f49ed2467c5e722b80da849abf5385a25f989240a8b33dbb2aa26`. All minified source bundles match the selected isolated candidate despite comment-only integration changes.

## Sizes that ship

Bytes are **minified / gzip / Brotli**. Both core builds use the committed tsdown configuration (unbundled ESM, no build minification) before the same esbuild consumer options. React entry also imports its built dist/index.js. PURE annotation survived the actual package build, and utility bundles demonstrably omit the reactive engine.

| Entry         |    Published build |        Local build | Gzip saving |
| ------------- | -----------------: | -----------------: | ----------: |
| createAtom    | 4815 / 1919 / 1782 | 4699 / 1866 / 1745 |          53 |
| fullStore     | 6489 / 2480 / 2305 | 6312 / 2431 / 2263 |          49 |
| reactSelector | 5330 / 2137 / 1983 | 5214 / 2088 / 1953 |          49 |
| batch         | 2699 / 1139 / 1071 |    173 / 158 / 132 |         981 |
| flush         | 2655 / 1112 / 1049 |    129 / 130 / 114 |         982 |
| toObserver    | 2727 / 1146 / 1063 |    180 / 145 / 122 |        1001 |
| shallow       | 3253 / 1323 / 1240 |    706 / 335 / 304 |         988 |

Direct-source consumer sizes remain a useful controlled comparison, but differ slightly from built-package results because build output and minifier layout differ:

| Entry         |        Main source |   Published source |       Local source |
| ------------- | -----------------: | -----------------: | -----------------: |
| createAtom    | 3661 / 1504 / 1403 | 4815 / 1924 / 1789 | 4699 / 1872 / 1753 |
| fullStore     | 5353 / 2077 / 1939 | 6511 / 2494 / 2321 | 6332 / 2443 / 2272 |
| reactSelector | 3978 / 1661 / 1543 | 5132 / 2082 / 1928 | 5016 / 2033 / 1896 |

On this identical source pipeline, createAtom saves **52 gzip bytes (2.7%)**, reducing the implementation's 420-byte overhead over main by **12.4%** (1924−1504 becomes 1872−1504). The remaining source overhead is 368 bytes. Comparing built-package 1866 directly with source-main 1504 would mix pipelines. The core result does not approach main's size, and the utility cuts should not be described as removing a newly introduced 1 KB PR cost.

## Final performance and retention

Seven rotated sequential rounds, nanoseconds per workload iteration. Positive deltas mean local is slower; spread is minimum–maximum, not a confidence interval.

| Workload                              | Main ns | Published ns | Local ns | vs published | Local min–max ns |
| ------------------------------------- | ------: | -----------: | -------: | -----------: | ---------------: |
| Plain mutable read (tiny)             |    2.25 |         2.19 |     2.20 |        +0.1% |        2.17–2.24 |
| Plain mutable write                   |    8.88 |         6.43 |     6.28 |        -2.4% |        6.23–6.38 |
| Mutable subscriber + snapshot get     |   42.86 |        38.51 |    38.75 |        +0.6% |      37.83–39.27 |
| Observed chain depth 1                |   71.76 |        71.01 |    68.97 |        -2.9% |      68.25–70.03 |
| Observed chain depth 8                |  245.74 |       261.55 |   252.75 |        -3.4% |    251.66–258.38 |
| Observed chain depth 32               |  867.12 |       914.54 |   903.46 |        -1.2% |    894.59–925.56 |
| Chain 8 after cold read + subscribe   |  244.81 |       258.10 |   254.89 |        -1.2% |    250.20–257.96 |
| Chain 8, three writes per batch       |  304.15 |       309.41 |   298.71 |        -3.5% |    296.54–301.10 |
| One computed, 64 numerical operations |  636.23 |       637.82 |   635.88 |        -0.3% |    627.20–723.95 |
| Observed cached chain 8 get (tiny)    |    3.30 |         4.63 |     4.65 |        +0.5% |        4.59–4.99 |
| Observed fanout 8                     |  442.96 |       487.85 |   481.20 |        -1.4% |    472.99–558.90 |
| Observed diamond 8                    |  339.21 |       378.50 |   366.73 |        -3.1% |    359.80–386.48 |
| Equality-suppressed computed update   |   47.91 |        45.24 |    44.90 |        -0.8% |      43.90–47.10 |
| Churn, unchanged source               |  445.11 |       341.50 |   321.18 |        -6.0% |    312.00–329.88 |
| Churn, source write while unmounted   |  466.31 |       535.71 |   514.70 |        -3.9% |    502.76–550.17 |

There is no material observed-update regression versus the published implementation in these cases: chain 8 improves 3.4%, diamond improves 3.1%, and direct subscribers differ by +0.6% within the sample spread. Clean observed reads differ by only +0.02 ns. Relative to main, chain 8/32 remain 2.9%/4.2% slower and diamond/fanout 8.1%/8.6% slower. Unchanged-source churn is 6.0% faster than published and 27.8% faster than main; source-write churn is 3.9% faster than published while still 10.4% slower than main. The size change does not make every path faster than main.

| Workload                          | Main ns | Published ns | Local ns | vs published | Local min–max ns |
| --------------------------------- | ------: | -----------: | -------: | -----------: | ---------------: |
| Dormant cached chain 8 get (tiny) |    3.51 |         5.64 |     5.82 |        +3.3% |        5.69–5.95 |
| Create/read/discard               |   56.48 |        91.82 |    87.39 |        -4.8% |      83.32–90.77 |
| Dormant chain 128 write + read    | 3255.07 |      5891.07 |  5379.44 |        -8.7% |  5151.46–5523.03 |

Dormant depth 128 improves 8.7% versus published (5.38 versus 5.89 µs). Cached dormant reads differ by +0.18 ns. Creation/discard improves 4.8% in this run; allocation samples remain sensitive to GC and the extra mutable-constructor closure should not be assumed free in applications. Roots are replaced every 256 iterations to bound main's leak during creation timing.

Operation counts remain linear: depth-128 relevant write/read performs 128 forward-link calls, zero reverse reattachments/detachments, zero warmed Link allocations and 129 updates (source + 128 computeds). Both the object-method and assigned-function updater sites were injected and asserted, avoiding false zero counts. Alternating a.get()/b.get() 1000 times retains two dependency records and allocates zero Links on a warmed recomputation.

All three GC trials leave 0/100 and 0/4000 never-observed local computations alive, with zero reverse root links, matching published. Main retains 100/100 and 4000/4000. Explicit unsubscribe leaves 0/100 in all variants; dropping active handles without unsubscribe leaves 100/100 in all. These are forced-GC reachability checks, not predictions of natural collection frequency.

## Attribution and rejected changes

Published source createAtom retains 2218 minified bytes from alien.ts and 2572 from atom.ts; main retains 1881 and 1755. Thus most of the added uncompressed code is atom lifecycle logic rather than extra store/async exports. Module byte contributions are additive; gzip/Brotli totals are not.

Individual global-validator, compact-link, inline-validator, bookkeeping and readable-name screens saved only 5–11 createAtom gzip bytes each. Sharing update acceptance logic increased gzip size and was rejected. A unified updater brought the combined source to 1842 gzip bytes (82 saved) but slowed direct mutable subscribers about **10.8%** in the focused screen; it was rejected. The chosen 1872 source variant retains separate update bodies and passed that screen. A pure annotation on the destructured factory call alone changed no bytes; the pure system object removed eager property reads and enabled utility tree shaking.

Main also retained the engine for utility-only entries: source toObserver is 1009 and shallow 1187 gzip bytes, compared with published 1149 and 1327. The final source entries are 145 and 334 respectively. This confirms the large utility benefit addresses a preexisting issue.

## Method and evidence

Node v25.8.1, Apple M3 Max/macOS arm64, esbuild 0.27.7 and tsdown 0.21.7. Consumer options: minified, tree-shaken browser ESM, ES2022; gzip level 9/Brotli quality 11; React and the selector shim external. Runtime guards use minified direct-source Node bundles, seven sequential isolated workers with rotated variants and two complete warmups per timed fresh graph. Setup, checks, cleanup and forced GC are excluded; preflight counters are separate from timed getters. Several-nanosecond cached reads and unstable allocation samples need absolute timings and spreads, not ratios alone. This is one Node/V8 machine, not a browser/application benchmark or confidence interval.

Independent final validation passed 256 runtime tests with one skip, 80,000 mixed DAG operations, nine focused cases, four TypeScript versions, lint, build/publint, documentation links, formatting, Knip and Sherif. Source and actual built-file hashes are preserved with raw data.

- [Final source hashes and source consumer sizes](results/size-final/manifest.json)
- [Actual tsdown built-package consumer sizes and hashes](results/size-final/dist-size-results.json)
- [Seven-round hot trials and quartiles](results/size-final/runtime-results.json)
- [Seven-round cold and creation guards](results/size-final/cold-guard-results.json)
- [Independent size screens](results/size-final/size-screens.json)
- [Rejected unified-updater runtime screen](results/size-focused/runtime-results.json)
- [Exact operation counts](results/size-final/operation-counts.json)
- [Three-process forced-GC reachability](results/size-final/retention-results.json)
- [Harness hashes](results/size-final/harness-hashes.json)
- [Independent validation](results/implementation-validation.json)

Run source size preparation with `node scripts/retention-bench/prepare.mjs /tmp/store-size main=HEAD production=.`. It now includes utility entries and minified module contributions. After normal package builds, verify shipping consumers with `node scripts/retention-bench/size-dist.mjs /tmp/store-dist production=./packages/store/dist/index.js`; built React adapter output must also exist. Historical objects must be present for exact baseline replay. Frozen source/build snapshots and rejected experiments remain under ignored .cache/retention-research. [HOT_PATH.md](HOT_PATH.md) preserves the prior lifecycle phase and is historical.
