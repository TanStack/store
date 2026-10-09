import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  fixedExtension: false,
  // NOTE: unlike react-store, `exports: true` is intentionally NOT set here.
  // tsdown's `exports: true` rewrites package.json "exports" from the built
  // entries only, which would wipe the hand-authored "./marko.json" subpath.
  // The Marko tags are built separately by `marko-type-check` (see the "build"
  // script) into dist/tags. Tags resolve by NAME via marko.json's "exports"
  // field; package.json "exports" additionally carries "./dist/tags/*" because
  // the consumer's compiler emits each discovered tag as a bare specifier
  // through the package and the consumer's BUNDLER resolves it via this map —
  // without the subpath every real consumer build fails. We maintain
  // package.json "exports" by hand.
  // publint runs as `test:build` AFTER the full build, not inline here: tsdown's
  // `clean` wipes dist and an inline publint would run before marko-type-check
  // emits dist/tags, structurally failing the "./dist/tags/*" exports check.
})
