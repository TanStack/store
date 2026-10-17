// Ambient declaration for *.marko template imports in tests.
// @marko/vite compiles .marko files to browser templates exposing mount(); the
// SSR (node-environment) tests additionally use the server template's render(),
// for which they cast the import to `any`. We declare the minimal browser shape
// here so the .ts test files type-check without the full Marko language toolchain.
declare module '*.marko' {
  const template: {
    mount: (
      input: Record<string, unknown>,
      container: Element | DocumentFragment,
    ) => { destroy: () => void }
  }
  export default template
}
