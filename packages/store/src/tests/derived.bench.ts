/* istanbul ignore file -- @preserve */
import { Store } from '../store'
import { Derived } from '../derived'
import { describe, bench } from 'vitest'
import { computed as vueComputed, ref, watch } from 'vue'
import { createEffect, createMemo, createSignal } from 'solid-js'
import {
  signal as preactSignal,
  computed as preactComputed,
  effect as preactEffect,
} from '@preact/signals'
import {
  signal as angularSignal,
  computed as angularComputed,
} from '@angular/core'
import { createWatch } from '@angular/core/primitives/signals'

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
    const b = new Derived([a], () => a.state)
    const c = new Derived([a], () => a.state)
    const d = new Derived([b], () => b.state)
    const e = new Derived([b], () => b.state)
    const f = new Derived([c], () => c.state)
    const g = new Derived([d, e, f], () => d.state + e.state + f.state)

    g.subscribe(() => noop(g.state))

    a.setState(() => 2)
  })

  bench('Vue', () => {
    const a = ref(1)
    const b = vueComputed(() => a.value)
    const c = vueComputed(() => a.value)
    const d = vueComputed(() => b.value)
    const e = vueComputed(() => b.value)
    const f = vueComputed(() => c.value)
    const g = vueComputed(() => d.value + e.value + f.value)

    watch(g, () => {
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