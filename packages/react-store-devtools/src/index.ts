'use client'

import * as Devtools from './StoreDevtools'
import * as plugin from './plugin'

export const StoreDevtoolsPanel =
  process.env.NODE_ENV !== 'development'
    ? Devtools.StoreDevtoolsPanelNoOp
    : Devtools.StoreDevtoolsPanel

export const storeDevtoolsPlugin =
  process.env.NODE_ENV !== 'development'
    ? plugin.storeDevtoolsNoOpPlugin
    : plugin.storeDevtoolsPlugin

export type { StoreDevtoolsReactInit } from './StoreDevtools'
