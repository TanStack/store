'use client'

import { createReactPanel } from '@tanstack/devtools-utils/react'
import { StoreDevtoolsCore } from '@tanstack/store-devtools/production'

import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'
import type { StoreDevtoolsInit } from '@tanstack/store-devtools/production'

export interface StoreDevtoolsReactInit
  extends DevtoolsPanelProps, StoreDevtoolsInit {}

const [StoreDevtoolsPanel] = createReactPanel<
  StoreDevtoolsReactInit,
  InstanceType<typeof StoreDevtoolsCore>
>(StoreDevtoolsCore)

export { StoreDevtoolsPanel }
