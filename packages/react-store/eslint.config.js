// @ts-check

import { defineConfig } from 'eslint/config'
import pluginReact from '@eslint-react/eslint-plugin'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import rootConfig from '../../eslint.config.js'

const reactRecommended = /** @type {any} */ (pluginReact.configs.recommended)
const reactHooksPlugin = /** @type {any} */ (pluginReactHooks)

export default defineConfig([
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
    ...reactRecommended,
  },
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@eslint-react/component-hook-factories': 'off',
    },
  },
])
