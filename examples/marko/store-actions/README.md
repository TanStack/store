# Marko Store — store-actions

A module-level store created with actions. Reads go through `<store-selector>`;
mutations call `store.actions.addCat` / `addDog` / `log`. There is no Marko
equivalent of the experimental `_useStore` tuple, and none is needed — holding
the store directly, `<store-selector>` plus `store.actions` cover the same ground.

To run this example:

- `npm install`
- `npm run dev` (or `npm run preview` for the production build)

It's an `@marko/run` app: the page is server-rendered, resumes in the browser,
and stays live. `npm run test:e2e` runs its Playwright smoke test.
