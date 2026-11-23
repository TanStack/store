# marko-store e2e — the production gate

A nested [@marko/run](https://github.com/marko-js/run) app that is this package's
end-to-end regression suite. It runs **against the production build, deliberately**:
`marko-run preview` (production build + serve) is the Playwright `webServer`, so every
run exercises what consumers actually get — tree-shaking, the hydration registry,
minified resume. Dev mode does none of that; it is exactly how the `sideEffects`
hydration bug shipped in a sibling package with a fully green dev-mode suite.

## Layout

- `src/routes/<name>/+page.marko` — one route per scenario (file-based routing). Seed
  values that used to live in the old hand-rolled harness's route table are inlined
  into the pages, each marked with a `Seeds inlined…` comment.
- `src/*.ts` — module-singleton stores, kept in separate modules per spec family so
  specs never share mutable state.
- `*.spec.ts` — the Playwright specs, one file per scenario.
- `marko.json` — resolves the package tags from `../src/tags` (source), the same
  workspace-source arrangement the examples use.

## What the suite covers

The migrated scenarios: from-mode selector/atom resume liveness, the context delivery
chain (provider → context-selector → store-context writes), per-request rebuild,
multi-store providers, in-order and out-of-order `<await>` streaming liveness,
streamed-helper independence/no-flash/no-JS, error composition rules (duplicate keys,
provider collisions, context-above-the-stream), and the fill characterizations.

New in this harness:

- `gate-render-only.spec.ts` — **the sideEffects hydration gate.** A render-only
  `<store-selector>` page (no handler touches any package function) is what a
  production bundler tree-shakes to death under a bad `"sideEffects": false`
  manifest: the page then never resumes. Verified fail→heal: with `false` the gate
  fails (resume marker stays `no`); with `"sideEffects": ["**/*.marko"]` the suite is
  green. Tree-shaking applies the manifest by nearest-`package.json` ownership, so
  the workspace-source tag channel reproduces the consumer bug faithfully.
- `payload.spec.ts` — rich payloads (string + nested array of objects, `Date`, `Map`,
  `Set`) through both provision channels, asserted in server HTML and live after
  resume.
- `client-only-first-paint.spec.ts` — the real-browser half of the getter-fed
  first-paint story: a browser-only mounted subtree recovers to the store value; the
  observed paint history documents the blank beat when it occurs.

One behavioral note from the migration: a pre-stream render throw (the
context-above rule) is surfaced by `@marko/run`'s node adapter as a transport-level
failure (connection dropped before any bytes), not the clean 500 the old hand-rolled
handler manufactured. The spec asserts the consumer-visible contract — request fails,
no partial body — and the throw itself stays pinned by the unit fixture.

## Running

```
pnpm -C e2e test:e2e   # production build + real Chromium (the gate)
pnpm -C e2e dev        # dev server, for interactive debugging only
```
