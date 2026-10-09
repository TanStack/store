---
"@tanstack/marko-store": minor
---

Add `@tanstack/marko-store`, a Marko 6 adapter for TanStack Store. It ships five tags — `<store-selector>` (the `useSelector`/`useStore` equivalent, with `selector` and `compare` support), `<store-atom>`, `<store-provider>` / `<store-context>` (per-request store provision for SSR without cross-request leakage), and `<stream-store-provider>` (stores born from late-awaited server data that render server-side and stay live after resume) — and re-exports the full `@tanstack/store` core. Works client-only and under SSR with Marko's resume, including out-of-order streaming.
