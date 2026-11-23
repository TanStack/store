# Marko examples for TanStack Store

These mirror the sibling adapter examples (react, svelte, …) using
`@tanstack/marko-store`. Every example is an [@marko/run](https://github.com/marko-js/run)
app — Marko's SSR meta-framework and the way real Marko apps ship — so each one
server-renders, resumes in the browser, and stays live. The parity examples
(`stores`, `simple`, `atoms`, `store-actions`, `store-context`) demonstrate the
same scenarios the other frameworks ship; `ssr-resume`, `ssr-per-request-multi`,
and `streaming` demonstrate the Marko-specific SSR patterns (resume, per-request
stores, streamed `<await>` data).

Each example runs standalone:

- `npm install`
- `npm run dev` — dev server
- `npm run preview` — production build + serve
- `npm run test:e2e` — a small Playwright smoke (renders, one interaction, no
  client errors)
- `npm run test:types` — `marko-type-check`

Every example carries a `marko.json` (`tags-dir` → the package's `src/tags`) and a
tsconfig `include` of those tags. This works around a Marko tag-discovery issue
under pnpm's isolated `node_modules`; when the upstream fix ships, both can go.
