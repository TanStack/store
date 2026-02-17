import { endBatch, startBatch } from './alien'
import { flush } from './atom'

export function batch(fn: () => void) {
  try {
    startBatch()
    fn()
  } finally {
    endBatch()
    flush()
  }
}
