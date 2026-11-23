---
'@tanstack/lit-store': patch
---

Keep `TanStackStoreSelector` and `TanStackStoreAtom` in sync with their host. The selector runs again on each host update, so selectors that read host properties stay current, and the subscription follows the host when it is moved in the DOM or removed.
