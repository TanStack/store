/* istanbul ignore file -- @preserve */
import {
  computed as angularComputed,
  signal as angularSignal,
} from '@angular/core'
import { createWatch } from '@angular/core/primitives/signals'
import {
  computed as preactComputed,
  effect as preactEffect,
  signal as preactSignal,
} from '@preact/signals'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { test } from 'vitest'
import { shallowRef, computed as vueComputed, watchEffect } from 'vue'
import { createStore } from '../src'

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
test('Derived', async ({ bench }) => {
  const tanstack = bench('TanStack', () => {
    const a = createStore(1)
    const b = createStore(() => a.state)
    const c = createStore(() => a.state)
    const d = createStore(() => b.state)
    const e = createStore(() => b.state)
    const f = createStore(() => c.state)
    const g = createStore(() => d.state + e.state + f.state)

    g.subscribe(() => noop(g.state))

    a.setState(() => 2)
  })

  const vue = bench('Vue', () => {
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

  const solid = bench('Solid', () => {
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

  const preact = bench('Preact', () => {
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

  const angular = bench('Angular', () => {
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

  await bench.compare(tanstack, vue, solid, preact, angular)
})
