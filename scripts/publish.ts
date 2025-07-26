// @ts-check

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publish } from '@tanstack/config/publish'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await publish({
  packages: [
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
    {
      name: '@tanstack/svelte-store',
      packageDir: 'packages/svelte-store',
    },
  ],
  branchConfigs: {
    main: {
      prerelease: false,
    },
    alpha: {
      prerelease: true,
    },
    beta: {
      prerelease: true,
    },
  },
  rootDir: resolve(__dirname, '..'),
  branch: process.env.BRANCH,
  tag: process.env.TAG,
  ghToken: process.env.GH_TOKEN,
})

process.exit(0)
