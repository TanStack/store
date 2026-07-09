'use client'

import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { StoreDevtoolsPanel } from './StoreDevtools'
import type { ReactStoreDevtoolsPlugin } from './types'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'

function ReactStoreDevtoolsPanel(props: DevtoolsPanelProps) {
  return <StoreDevtoolsPanel {...props} adapterName="React" />
}

const [storeDevtoolsPlugin, storeDevtoolsNoOpPlugin]: readonly [
  ReactStoreDevtoolsPlugin,
  ReactStoreDevtoolsPlugin,
] = createReactPlugin({
  name: 'TanStack Store',
  Component: ReactStoreDevtoolsPanel,
})

export { storeDevtoolsNoOpPlugin, storeDevtoolsPlugin }
