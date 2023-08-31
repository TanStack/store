// @ts-check

import { defineConfig } from 'rollup'
import { buildConfigs } from '../../scripts/getRollupConfig.js'

export default defineConfig(
  buildConfigs({
    name: 'react-store',
    outputFile: 'index',
    entryFile: './src/index.tsx',
  }),
)
