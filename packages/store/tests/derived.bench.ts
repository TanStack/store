/* istanbul ignore file -- @preserve */
import { bench, describe } from 'vitest'
import { shallowRef, computed as vueComputed, watchEffect } from 'vue'
import { createEffect, createMemo, createSignal } from 'solid-js'
import {
  computed as preactComputed,
  effect as preactEffect,
  signal as preactSignal,
} from '@preact/signals'
import {
  computed as angularComputed,
  signal as angularSignal,
} from '@angular/core'
import { createWatch } from '@angular/core/primitives/signals'
import { Store } from '../src/store'
import { Derived } from '../src/derived'

function noop(val: any) {
  val
}

/**
 *         A
 *        / \
 *       B   C
 *      / \  |
 *     D  E  F
 *      \ / |
 *       \ /
 *        G
 */
describe('Derived', () => {
  bench('TanStack', () => {
    const a = new Store(1)
    const b = new Derived({ deps: [a], fn: () => a.state })
    b.mount()
    const c = new Derived({ deps: [a], fn: () => a.state })
    c.mount()
    const d = new Derived({ deps: [b], fn: () => b.state })
    d.mount()
    const e = new Derived({ deps: [b], fn: () => b.state })
    e.mount()
    const f = new Derived({ deps: [c], fn: () => c.state })
    f.mount()
    const g = new Derived({
      deps: [d, e, f],
      fn: () => d.state + e.state + f.state,
    })
    g.mount()

    g.subscribe(() => noop(g.state))

    a.setState(() => 2)
  })

  bench('Vue', () => {
    const a = shallowRef(1)
    const b = vueComputed(() => a.value)
    const c = vueComputed(() => a.value)
    const d = vueComputed(() => b.value)
    const e = vueComputed(() => b.value)
    const f = vueComputed(() => c.value)
    const g = vueComputed(() => d.value + e.value + f.value)

    watchEffect(() => {
      noop(g.value)
    })

    a.value = 2
  })

  bench('Solid', () => {
    const [a, setA] = createSignal(1)
    const b = createMemo(() => a())
    const c = createMemo(() => a())
    const d = createMemo(() => b())
    const e = createMemo(() => b())
    const f = createMemo(() => c())
    const g = createMemo(() => d() + e() + f())

    createEffect(() => {
      noop(g())
    })

    setA(2)
  })

  bench('Preact', () => {
    const a = preactSignal(1)
    const b = preactComputed(() => a.value)
    const c = preactComputed(() => a.value)
    const d = preactComputed(() => b.value)
    const e = preactComputed(() => b.value)
    const f = preactComputed(() => c.value)
    const g = preactComputed(() => d.value + e.value + f.value)

    preactEffect(() => {
      noop(g.value)
    })

    a.value = 2
  })

  bench('Angular', () => {
    const a = angularSignal(1)
    const b = angularComputed(() => a())
    const c = angularComputed(() => a())
    const d = angularComputed(() => b())
    const e = angularComputed(() => b())
    const f = angularComputed(() => c())
    const g = angularComputed(() => d() + e() + f())

    createWatch(
      () => {
        console.log(g())
      },
      () => {},
      false,
    )

    a.set(2)
  })
})
