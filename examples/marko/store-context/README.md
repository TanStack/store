# Marko Store — store-context

The flagship for the adapter's delivery trio. `<store-provider>` parks a bundle
of `{ votesStore, countAtom }`; nested components read the store with
`<store-selector context=...>`, read the atom the same way (and with `<store-atom>`
for read/write), and write through `<store-context>`. Where the other frameworks
lean on their native context, Marko uses provider + context + selector.

To run this example:

- `npm install`
- `npm run dev` (or `npm run preview` for the production build)

It's an `@marko/run` app: the page is server-rendered, resumes in the browser,
and stays live. `npm run test:e2e` runs its Playwright smoke test.
