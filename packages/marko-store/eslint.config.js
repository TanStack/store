// @ts-check

import { defineConfig } from 'eslint/config'
import rootConfig from '../../eslint.config.js'

export default defineConfig([
  ...rootConfig,
  {
    // The e2e @marko/run app generates route types and a production build in
    // place; neither is source.
    ignores: ['e2e/.marko-run/**', 'e2e/dist/**'],
  },
])
