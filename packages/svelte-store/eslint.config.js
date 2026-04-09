// @ts-check

import { defineConfig } from 'eslint/config'
import pluginSvelte from 'eslint-plugin-svelte'
import rootConfig from '../../eslint.config.js'

export default defineConfig([
  ...rootConfig,
  ...pluginSvelte.configs['flat/recommended'],
  {
    files: ['src/**/*.svelte.ts'],
    rules: {
      'import/newline-after-import': 'off',
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
