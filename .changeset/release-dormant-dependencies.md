---
'@tanstack/store': patch
---

Release unused computed atoms from dependency subscriptions so they can be garbage collected after reads. Preserve cached snapshots and custom equality while validating dormant dependency chains in linear work. Keep observed reads on the attached-link path and preserve captured getter references across subscription changes.

Share dormant dependency validation and improve tree shaking so utility-only imports do not include the reactive engine.
