import path from 'path'
import { BranchConfig, Package } from './types'

// TODO: List your npm packages here.
export const packages: Package[] = [
  {
    name: '@tanstack/store',
    packageDir: 'store',
    srcDir: 'src',
    builds: [
      {
        jsName: 'Store',
        entryFile: 'src/index.ts',
        globals: {},
      },
    ],
  },
  {
    name: '@tanstack/react-store',
    packageDir: 'react-store',
    srcDir: 'src',
    builds: [
      {
        jsName: 'ReactLoaders',
        entryFile: 'src/index.tsx',
        globals: {
          react: 'React',
        },
      },
    ],
  }
]

export const latestBranch = 'main'

export const branchConfigs: Record<string, BranchConfig> = {
  main: {
    prerelease: false,
    ghRelease: true,
  },
  next: {
    prerelease: true,
    ghRelease: true,
  },
  beta: {
    prerelease: true,
    ghRelease: true,
  },
  alpha: {
    prerelease: true,
    ghRelease: true,
  },
}

export const rootDir = path.resolve(__dirname, '..')
export const examplesDirs = [
  'examples/react',
  // 'examples/solid',
  // 'examples/svelte',
  // 'examples/vue',
]
