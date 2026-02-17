// @ts-check

import { defineConfig } from 'eslint/config'
// @ts-ignore: no types for eslint-config-preact
import preact from 'eslint-config-preact'
import rootConfig from '../../eslint.config.js'
// eslint-config-preact uses typescript-eslint under the hood
import tseslint from 'typescript-eslint'

export default defineConfig([
  ...rootConfig,
  ...preact,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Disable base rule to prevent overload false positives
      'no-redeclare': 'off',
      // TS-aware version handles overloads correctly
      '@typescript-eslint/no-redeclare': 'error',
    },
  },
])
