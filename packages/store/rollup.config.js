// @ts-check

import { defineConfig } from 'rollup'
import { buildConfigs } from '../../scripts/getRollupConfig.js'

export default defineConfig(
  buildConfigs({
    name: 'store',
    outputFile: 'index',
    entryFile: './src/index.ts',
  }),
)
