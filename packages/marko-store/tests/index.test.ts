import { describe, expect, test } from 'vitest'
import {
  ReadonlyStore,
  Store,
  batch,
  createAsyncAtom,
  createAtom,
  createStore,
  flush,
  shallow,
  toObserver,
} from '../src/index'

describe('@tanstack/marko-store re-exports @tanstack/store', () => {
  test('store constructors are present', () => {
    expect(typeof createStore).toBe('function')
    expect(typeof Store).toBe('function')
    expect(typeof ReadonlyStore).toBe('function')
  })

  test('atom constructors are present', () => {
    expect(typeof createAtom).toBe('function')
    expect(typeof createAsyncAtom).toBe('function')
  })

  test('utilities are present', () => {
    for (const fn of [batch, flush, shallow, toObserver]) {
      expect(typeof fn).toBe('function')
    }
  })

  test('a re-exported store actually works', () => {
    const store = createStore({ n: 1 })
    store.setState((prev) => ({ n: prev.n + 1 }))
    expect(store.get().n).toBe(2)
  })
})
