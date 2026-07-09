import { constructCoreClass } from '@tanstack/devtools-utils/solid'

export interface StoreDevtoolsInit {
  adapterName?: string
}

// TODO fix type inference error
export const [StoreDevtoolsCore, StoreDevtoolsCoreNoOp] = constructCoreClass(
  () => import('./components'),
  // TODO non portable type error report? Form-v2 isn't experiencing this, but I can't figure out why this would happen
) as [any, any]
