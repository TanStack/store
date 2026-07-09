'use client'

import { createReactPanel } from '@tanstack/devtools-utils/react'
import { StoreDevtoolsCore } from '@tanstack/store-devtools'

import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'
import type { StoreDevtoolsInit } from '@tanstack/store-devtools'

export interface StoreDevtoolsReactInit
  extends DevtoolsPanelProps, StoreDevtoolsInit {}

const [StoreDevtoolsPanel, StoreDevtoolsPanelNoOp] = createReactPanel<
  StoreDevtoolsReactInit,
  InstanceType<typeof StoreDevtoolsCore>
>(StoreDevtoolsCore)

export { StoreDevtoolsPanel, StoreDevtoolsPanelNoOp }
