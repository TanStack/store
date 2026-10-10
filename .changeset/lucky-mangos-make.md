---
'@tanstack/react-store': patch
---

Mark React hooks and context modules as client boundaries so RSC bundlers do not link them against React's server-only entry. Core Store reexports remain available to Server Components, and ordinary SSR continues using the real hooks.
