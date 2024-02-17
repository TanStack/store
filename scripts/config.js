// @ts-check

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * List your npm packages here. The first package will be used as the versioner.
 * @type {import('./types').Package[]}
 */
export const packages = [
  {
    name: '@tanstack/store',
    packageDir: 'packages/store',
  },
  {
    name: '@tanstack/react-store',
    packageDir: 'packages/react-store',
  },
  {
    name: '@tanstack/vue-store',
    packageDir: 'packages/vue-store',
  },
  {
    name: '@tanstack/solid-store',
    packageDir: 'packages/solid-store',
  },
  {
    name: '@tanstack/angular-store',
    packageDir: 'packages/angular-store',
  },
  // {
  //   name: '@tanstack/svelte-store',
  //   packageDir: 'packages/svelte-store',
  // },
]

/**
 * Contains config for publishable branches.
 * @type {Record<string, import('./types').BranchConfig>}
 */
export const branchConfigs = {
  main: {
    prerelease: false,
  },
  next: {
    prerelease: true,
  },
  beta: {
    prerelease: true,
  },
  alpha: {
    prerelease: true,
  },
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))
export const rootDir = resolve(__dirname, '..')
