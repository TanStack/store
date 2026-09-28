---
'@tanstack/store': patch
---

Prevent atom reads inside subscription observers from becoming subscription dependencies and causing unrelated updates to notify the observer.
