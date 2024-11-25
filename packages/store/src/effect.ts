import { Derived } from './derived'
import type { DerivedOptions } from './derived'

interface EffectOptions
  extends Omit<DerivedOptions<unknown>, 'onUpdate' | 'onSubscribe' | 'lazy'> {
  /**
   * Should the effect trigger immediately?
   * @default false
   */
  eager?: boolean
}

export class Effect {
  /**
   * @private
   */
  _derived: Derived<void>

  constructor(opts: EffectOptions) {
    const { eager, fn, ...derivedProps } = opts

    this._derived = new Derived({
      ...derivedProps,
      fn: () => {},
      onUpdate() {
        fn()
      },
    })

    if (eager) {
      fn()
    }
  }

  mount() {
    return this._derived.mount()
  }
}
