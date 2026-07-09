'use client'

// TODO I don't think this is tree shaken. Then again, if it's unused, then it gets pruned, no?
import './devtoolsBridge.lib'
import * as Devtools from './core'

import type { ClassType } from '@tanstack/devtools-utils/solid/class'

export const StoreDevtoolsCore: ClassType =
  process.env.NODE_ENV !== 'development'
    ? Devtools.StoreDevtoolsCoreNoOp
    : Devtools.StoreDevtoolsCore

export type { StoreDevtoolsInit } from './core'
