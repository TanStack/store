import type { ReactiveController, ReactiveControllerHost } from 'lit'

export interface UseSelectorOptions<TSelected> {
  compare?: (a: TSelected, b: TSelected) => boolean
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

function defaultSelector<TSource, TSelected>(snapshot: TSource): TSelected {
  return snapshot as unknown as TSelected
}

type SelectionSource<T> = {
  get: () => T
  subscribe: (listener: (value: T) => void) => {
    unsubscribe: () => void
  }
}

/**
 * Subscribes a Lit host to a TanStack Store and exposes a selected slice of its state.
 *
 * The host will only re-render when the selected value actually changes
 * (according to the configured `compare` function).
 *
 * @example
 * ```ts
 * class UserNameEl extends LitElement {
 *   #name = new TanStackStoreSelector(
 *     this,
 *     () => userStore,
 *     (snapshot) => snapshot.name,
 *   )
 *
 *   render() {
 *     return html`<p>${this.#name.value}</p>`
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * class UserNameEl extends LitElement {
 *   _ = new TanStackStoreAtom(
 *     this,
 *     () => userStore,
 *     (snapshot) => snapshot.name,
 *   )
 *
 *   render() {
 *     return html`<p>${userStore.state.name}</p>`
 *   }
 * }
 * ```
 *
 */
export class TanStackStoreSelector<
  TSource,
  TSelected = NoInfer<TSource>,
> implements ReactiveController {
  #host: ReactiveControllerHost
  #getStore: () => SelectionSource<TSource> | undefined
  #selector: (snapshot: TSource) => TSelected
  #compare: (a: TSelected, b: TSelected) => boolean
  #unsubscribe?: () => void
  #subscribedStore?: SelectionSource<TSource>
  #hasSelected = false
  #lastSelected?: TSelected

  constructor(
    host: ReactiveControllerHost,
    getStore: () => SelectionSource<TSource> | undefined,
    selector: (snapshot: TSource) => TSelected = defaultSelector,
    options?: UseSelectorOptions<TSelected>,
  ) {
    this.#host = host
    this.#getStore = getStore
    this.#selector = selector
    this.#compare = options?.compare ?? defaultCompare
    host.addController(this)
  }

  get value(): TSelected | undefined {
    return this.#lastSelected
  }

  hostUpdate() {
    const store = this.#getStore()
    if (store === this.#subscribedStore) return
    this.#unsubscribe?.()
    this.#subscribedStore = store
    if (!store) {
      this.#unsubscribe = undefined
      this.#hasSelected = false
      this.#lastSelected = undefined
      return
    }
    this.#lastSelected = this.#selector(store.get())
    this.#hasSelected = true
    this.#unsubscribe = store.subscribe((value) => {
      const next = this.#selector(value)
      if (this.#hasSelected && this.#compare(this.#lastSelected!, next)) {
        return
      }
      this.#lastSelected = next
      this.#hasSelected = true
      this.#host.requestUpdate()
    }).unsubscribe
  }

  hostDisconnected() {
    this.#unsubscribe?.()
    this.#unsubscribe = undefined
    this.#subscribedStore = undefined
    this.#hasSelected = false
    this.#lastSelected = undefined
  }
}
