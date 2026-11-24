---
'@tanstack/svelte-store': patch
---

Add `.js` extensions to the `useAtom`, `useStore`, and `_useStore` re-exports in `index.svelte.ts` so the published package loads under Node ESM and resolves under `node16`/`nodenext` TypeScript module resolution
