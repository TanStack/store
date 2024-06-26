// @ts-check

// @ts-expect-error
import { rootConfig } from '@tanstack/config/eslint'

export default [
  ...rootConfig,
  {
    name: 'tanstack/temp',
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
]
