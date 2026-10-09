# Marko Store — ssr-per-request-multi

Two pages. The home page (`/`) rebuilds a store from per-request DATA passed by
the route — deliberately richer than a counter: a string, a Date, and a nested
array of objects, with selectors slicing each (the array slice through the
SSR-safe inline `shallow` compare). The data crosses in the serialized payload
and the store is rebuilt on each side. The `/multi` page parks a bundle of two stores in one provider, read
independently, with a context write targeting one.

To run this example:

- `npm install`
- `npm run dev` (or `npm run preview` for the production build)

It's an `@marko/run` app: the page is server-rendered, resumes in the browser,
and stays live. `npm run test:e2e` runs its Playwright smoke test.
- open `/` and `/multi`
