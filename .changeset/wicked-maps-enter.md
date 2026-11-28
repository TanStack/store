---
'@tanstack/store': patch
'@tanstack/react-store': patch
'@tanstack/preact-store': patch
---

Keep computed atom subscriptions active when a getter throws. Notify observers through their optional error handler, rethrow the cached error on reads, and resume value notifications when the getter recovers.

Notify mounted React and Preact selectors when a computed getter throws so the nearest error boundary can render its fallback.
