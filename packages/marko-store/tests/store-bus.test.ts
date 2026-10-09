/** The bell: a tiny client-side pub/sub the provider rings on mount so empty-shelf
 *  readers re-resolve on resume. Unit-level so the recovery primitive is pinned
 *  independent of a full resume (the resume round-trip itself is the e2e's job). */
import { describe, expect, test, vi } from 'vitest'
import { publishStore, subscribeStorePublish } from '../src/tags/store-bus'

describe('store-bus', () => {
  test('publish notifies all current subscribers', () => {
    const a = vi.fn()
    const b = vi.fn()
    const offA = subscribeStorePublish(a)
    const offB = subscribeStorePublish(b)
    publishStore()
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    offA()
    offB()
  })
  test('unsubscribe stops further notifications', () => {
    const a = vi.fn()
    const off = subscribeStorePublish(a)
    off()
    publishStore()
    expect(a).not.toHaveBeenCalled()
  })
  test('a throwing subscriber does not break the others', () => {
    const good = vi.fn()
    const offBad = subscribeStorePublish(() => {
      throw new Error('boom')
    })
    const offGood = subscribeStorePublish(good)
    expect(() => publishStore()).not.toThrow()
    expect(good).toHaveBeenCalledTimes(1)
    offBad()
    offGood()
  })
})
