# Marko Store — ssr-resume

A server-rendered page: the server paints the store's value, then the page
resumes and the store stays live (external writes and the atom write work after
load). The store is a module singleton and is rebuilt on each side, so no live
store is ever serialized.

To run this example:

- `npm install`
- `npm run dev` (or `npm run preview` for the production build)

It's an `@marko/run` app: the page is server-rendered, resumes in the browser,
and stays live. `npm run test:e2e` runs its Playwright smoke test.
