import type { InternalBaseAtom, InternalReadonlyAtom } from './types'

// TODO fix template
export interface $StoreDevtoolsBridge {
  /**
   * Be descriptive here! It's important that the function call can be easily reasoned about when someone is confused.
   *
   * As far as parameters go, keep it vague. Core should do as little calculation as possible.
   */
  mountStore?: (atom: InternalBaseAtom<any> | InternalReadonlyAtom<any>) => void
}

let activeBridge: $StoreDevtoolsBridge | null = null

/**
 * Installs the active Devtools bridge for store lifecycle notifications.
 *
 * This is intentionally an internals-only API. Store Devtools calls it when the
 * Devtools panel/context is mounted, and core runtime code reads the active
 * bridge through `devtools()`. The returned cleanup removes this bridge only if
 * it is still the active bridge.
 */
export function $installDevtoolsBridge(
  bridge: $StoreDevtoolsBridge,
): () => void {
  activeBridge = bridge

  let didUninstall = false

  return () => {
    if (didUninstall) return
    didUninstall = true

    if (activeBridge !== bridge) return

    activeBridge = null
  }
}

/**
 * Returns the active bridge, or an empty bridge object when Devtools is absent. This is what
 * should be used throughout the core to emit events when necessary.
 *
 * @example
 * mount() {
 *   $storeDevtools().mountAtom?.(this)
 * }
 */
export function $storeDevtools(): $StoreDevtoolsBridge {
  // Double conditional chains are dumb, so I prefer this approach
  return activeBridge ?? {}
}
