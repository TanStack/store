# Marko Store — atoms

A module-level `createAtom`. The read-only total uses `<store-selector>` (no
selector function = the whole value); the editable count uses `<store-atom>`,
whose binding writes back through `atom.set`. Reset calls `atom.set(0)`.

To run this example:

- `npm install`
- `npm run dev` (or `npm run preview` for the production build)

It's an `@marko/run` app: the page is server-rendered, resumes in the browser,
and stays live. `npm run test:e2e` runs its Playwright smoke test.
