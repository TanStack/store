// @ts-check

// Oxlint lints this package, including `<script>` blocks. ESLint runs only
// the Svelte template rules, which need `svelte-eslint-parser`.
import tsParser from '@typescript-eslint/parser'
import pluginSvelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import svelteConfig from './svelte.config.js'

export default defineConfig([
  ...pluginSvelte.configs['recommended'],
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
  {
    rules: {
      'svelte/block-lang': ['error', { script: ['ts'] }],
      'svelte/no-svelte-internal': 'error',
      'svelte/valid-compile': 'off',
    },
  },
])
