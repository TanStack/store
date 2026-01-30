---
'@tanstack/angular-store': patch
'@tanstack/preact-store': patch
'@tanstack/svelte-store': patch
'@tanstack/react-store': patch
'@tanstack/solid-store': patch
'@tanstack/vue-store': patch
---

Fix adapter `shallow` equality for keyless value objects (e.g. Temporal) so updates aren’t skipped.
