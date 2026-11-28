---
'@tanstack/store': patch
---

Keep computed atom subscriptions active when a getter throws. Notify observers through their optional error handler, rethrow the cached error on reads, and resume value notifications when the getter recovers.
