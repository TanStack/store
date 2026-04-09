import { defineConfig } from 'tsdown'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  entry: ['./src/index.tsx'],
  format: ['esm', 'cjs'],
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  fixedExtension: false,
  exports: {
    customExports(exports) {
      const rootExport =
        typeof exports['.'] === 'object' && exports['.'] !== null
          ? exports['.']
          : {}

      return {
        ...exports,
        '.': {
          ...rootExport,
          solid: './dist/index.js',
        },
      }
    },
  },
  publint: {
    strict: true,
  },
})
