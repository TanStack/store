import { ReactiveNode, ReactiveFlags } from '../../../../../stackblitz/alien-signals/src/system'
import { setCurrentSub } from '../../../../../stackblitz/alien-signals/src/index'
import { unlink, startTracking, endTracking } from './scheduler'

interface EffectOptions {
  /**
   * Should the effect trigger immediately?
   * @default false
   */
  eager?: boolean
  fn: () => void
}

interface EffectNode extends ReactiveNode {
  effect: Effect
}

export class Effect {
  private _node: EffectNode
  private _isMounted = false
  private _fn: () => void

  constructor(opts: EffectOptions) {
    const { eager, fn } = opts

    this._fn = fn
    
    this._node = {
      effect: this,
      flags: ReactiveFlags.Watching
    }

    if (eager) {
      this.runEffect()
    }
  }

  private unlinkFromDependencies() {
    let deps = this._node.deps
    while (deps) {
      const nextDep = deps.nextDep
      unlink(deps, this._node)
      deps = nextDep
    }
  }

  runEffect() {
    // Set up tracking context for this effect
    const prevSub = setCurrentSub(this._node)
    startTracking(this._node)
    
    try {
      this._fn()
    } finally {
      // Clean up tracking context
      setCurrentSub(prevSub)
      endTracking(this._node)
    }
  }

  mount() {
    if (this._isMounted) {
      return () => {}
    }
    
    this._isMounted = true
    // Run the effect once to establish dependencies through tracking
    this.runEffect()

    return () => {
      this._isMounted = false
      this.unlinkFromDependencies()
    }
  }
}
