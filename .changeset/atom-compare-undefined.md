---
'@tanstack/store': patch
---

Fix atoms skipping `compare` whenever their previous value was `undefined`. A computed atom that keeps returning `undefined` no longer notifies its subscribers on every recompute, and a custom `compare` now decides updates from an `undefined` value too. A computed atom's first computation still skips `compare`.
