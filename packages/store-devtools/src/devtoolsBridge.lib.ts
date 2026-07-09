import { $internals } from '@tanstack/store'

function createBridge(): Required<$internals.$StoreDevtoolsBridge> {
  return {
    mountStore: (atom) => {
      void atom._snapshot
    },
  }
}

$internals.$installDevtoolsBridge(createBridge())
