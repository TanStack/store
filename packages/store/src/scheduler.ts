import { createReactiveSystem, ReactiveNode } from '../../../../../stackblitz/alien-signals/src/system'
import { startBatch, endBatch, ReactiveFlags } from '../../../../../stackblitz/alien-signals/src/index'

/**
 * Singleton reactive system that all components (Store, Derived, Effect) use.
 * This ensures proper propagation and dependency tracking across the entire system.
 */

interface StoreNode extends ReactiveNode {
  store: any
}

interface DerivedNode extends ReactiveNode {
  derived: any
}

interface EffectNode extends ReactiveNode {
  effect: any
}

type AnyNode = StoreNode | DerivedNode | EffectNode

let batchDepth = 0
let batchedUpdates = new Set<AnyNode>()

// Create a single reactive system instance that all components will use
export const reactiveSystem = createReactiveSystem({
  update(node: AnyNode): boolean {
    if ('store' in node) {
      const store = node.store
      const changed = store.prevState !== store.state
      return changed
    } else if ('derived' in node) {
      const derived = node.derived
      
      derived.prevState = derived._state
      
      const prevDepVals = [...derived.lastSeenDepValues]
      const currDepVals = derived.getDepVals()
      
      const newValue = derived.options.fn({
        prevDepVals: prevDepVals.length > 0 ? prevDepVals as never : undefined,
        prevVal: derived.prevState,
        currDepVals: currDepVals as never,
      })
      
      const changed = derived._state !== newValue
      if (changed) {
        derived._state = newValue
        derived.lastSeenDepValues = [...currDepVals]
        derived.options.onUpdate?.()
      }
      
      return changed
    }
    
    return false
  },
  
  notify(node: AnyNode): void {
    if (batchDepth > 0) {
      batchedUpdates.add(node)
      return
    }

    if ('effect' in node) {
      node.effect.runEffect()
    } else if ('derived' in node) {
      const derived = node.derived
      
      if (node.flags & (ReactiveFlags.Pending | ReactiveFlags.Dirty)) {
        manualUpdate(node)
      }
      
      derived.listeners.forEach((listener: any) =>
        listener({
          prevVal: derived.prevState as never,
          currentVal: derived._state as never,
        })
      )
    }
  },
  
  unwatched(node: AnyNode): void {
    let deps = node.deps
    while (deps) {
      const nextDep = deps.nextDep
      unlink(deps, node)
      deps = nextDep
    }
  }
})

export const { 
  link, 
  unlink, 
  propagate, 
  checkDirty, 
  startTracking, 
  endTracking,
  shallowPropagate
} = reactiveSystem

// Enhanced batching with deduplication
export function batch(fn: () => void) {
  batchDepth++
  startBatch()
  try {
    fn()
  } finally {
    batchDepth--
    if (batchDepth === 0) {
      const updates = Array.from(batchedUpdates)
      batchedUpdates.clear()
      
      updates.forEach(node => {
        if (node.flags & (ReactiveFlags.Pending | ReactiveFlags.Dirty)) {
          if ('derived' in node) {
            manualUpdate(node)
          }
        }
      })
      
      updates.forEach(node => {
        if ('derived' in node) {
          const derived = node.derived
          derived.listeners.forEach((listener: any) =>
            listener({
              prevVal: derived.prevState as never,
              currentVal: derived._state as never,
            })
          )
        }
      })
    }
    endBatch()
  }
}

export function manualUpdate(node: AnyNode): boolean {
  if ('derived' in node) {
    const derived = node.derived
    
    derived.prevState = derived._state
    
    const prevDepVals = [...derived.lastSeenDepValues]
    const currDepVals = derived.getDepVals()
    
    const newValue = derived.options.fn({
      prevDepVals: prevDepVals.length > 0 ? prevDepVals as never : undefined,
      prevVal: derived.prevState,
      currDepVals: currDepVals as never,
    })
    
    const changed = derived._state !== newValue
    derived._state = newValue
    derived.lastSeenDepValues = [...currDepVals]
    
    derived.options.onUpdate?.()
    
    node.flags &= ~(ReactiveFlags.Dirty | ReactiveFlags.Pending)
    
    return changed
  }
  return false
}
