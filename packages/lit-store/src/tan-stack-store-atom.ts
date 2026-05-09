import { TanStackStoreSelector } from './tan-stack-store-selector.js'
import type { Atom } from '@tanstack/store'
import type { ReactiveControllerHost } from 'lit'
import type { UseSelectorOptions } from './tan-stack-store-selector.js'

/**
 * Subscribes a Lit host to a writable atom and exposes its current value
 * along with a stable setter.
 *
 * Use this when an element needs to both read and update the same writable
 * atom. The host will only re-render when the atom's value actually changes
 * (according to the configured `compare` function).
 *
 * @example
 * ```ts
 * class CounterEl extends LitElement {
 *   #count = new TanStackAtom(this, () => countAtom)
 *
 *   render() {
 *     return html`
 *       <button @click=${() => this.#count.set((prev) => prev + 1)}>
 *         ${this.#count.value}
 *       </button>
 *     `
 *   }
 * }
 * ```
 */
export class TanStackStoreAtom<TValue> {
  #getAtom: () => Atom<TValue> | undefined
  #selector: TanStackStoreSelector<TValue, TValue>

  constructor(
    host: ReactiveControllerHost,
    getAtom: () => Atom<TValue> | undefined,
    options?: UseSelectorOptions<TValue>,
  ) {
    this.#getAtom = getAtom
    this.#selector = new TanStackStoreSelector(
      host,
      getAtom,
      undefined,
      options,
    )

    this.set = this.set.bind(this)
  }

  get value(): TValue | undefined {
    return this.#getAtom()?.get()
  }

  set(value: TValue): void
  set(updater: (prev: TValue) => TValue): void
  set(valueOrUpdater: TValue | ((prev: TValue) => TValue)): void {
    const atom = this.#getAtom()
    if (!atom) return
    ;(atom.set as (v: TValue | ((prev: TValue) => TValue)) => void)(
      valueOrUpdater,
    )
  }
}
