import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** Use the pinned dev dependency, or an explicitly selected installed bundler. */
export function loadEsbuild() {
  return require(process.env.ESBUILD_PATH || 'esbuild')
}
