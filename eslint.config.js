// @ts-check

import { fileURLToPath } from 'node:url'
// @ts-expect-error
import eslint from '@eslint/js'
// @ts-expect-error
import tseslint from 'typescript-eslint'
// @ts-expect-error
import pluginImport from 'eslint-plugin-import-x'
// @ts-expect-error
import globals from 'globals'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    ignores: ['**/build', '**/coverage', '**/dist'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': pluginImport,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreParameters: true },
      ],
      '@typescript-eslint/prefer-for-of': 'off',
      'import-x/default': 'off',
      'import-x/export': 'off',
      'import-x/namespace': 'off',
      'import-x/newline-after-import': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-unused-modules': ['off', { unusedExports: true }],
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
        },
      ],
      'no-async-promise-executor': 'off',
      'no-empty': 'off',
      'no-redeclare': 'off',
      'no-shadow': 'error',
      'no-undef': 'off',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
    },
  },
)
