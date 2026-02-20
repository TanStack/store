---
'@tanstack/react-store': patch
'@tanstack/preact-store': patch
'@tanstack/vue-store': patch
'@tanstack/solid-store': patch
'@tanstack/svelte-store': patch
'@tanstack/angular-store': patch
---

Fix Temporal value comparison in framework adapter `shallow` equality helpers.

Framework adapters now treat Temporal objects (including `temporal-polyfill`) using Temporal value semantics via `equals()` instead of falling back to empty-key object comparison. This ensures selectors correctly detect changed Temporal values and prevents missed updates.

No API changes are required for consumers. Existing `useStore`/`injectStore` usage continues to work; this release only corrects equality behavior for Temporal objects.
