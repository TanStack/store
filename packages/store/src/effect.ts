import { Derived } from './derived'
import type { Deps } from './derived'

export class Effect {
  _derived: Derived<void>

  constructor(items: Deps, effectFn: () => void) {
    this._derived = new Derived(items, () => {}, {
      onUpdate() {
        effectFn()
      },
    })
  }

  cleanup() {
    this._derived.cleanup()
  }

  [Symbol.dispose]() {
    this.cleanup()
  }
}
