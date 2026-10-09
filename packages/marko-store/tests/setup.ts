/**
 * Marko scheduler polyfills for jsdom.
 *
 * Marko 6's scheduler (schedule.ts) walks queueMicrotask -> requestAnimationFrame
 * -> MessageChannel. jsdom's rAF and MessageChannel are unreliable: rAF may never
 * fire and MessageChannel may not integrate with the event loop. Without these,
 * the module-level `isScheduled` flag sticks after the first scheduled render and
 * every later update queues but never flushes. These mirror Marko's own test
 * infrastructure (runtime-tags create-browser.ts), as does @tanstack/marko-query.
 */

if (typeof window !== 'undefined') {
  // requestAnimationFrame: batch callbacks, fire on the next macrotask.
  let queue: Array<FrameRequestCallback> | undefined
  ;(window as any).requestAnimationFrame = function requestAnimationFrame(
    fn: FrameRequestCallback,
  ) {
    if (queue) {
      queue.push(fn)
    } else {
      queue = [fn]
      setTimeout(() => {
        const timestamp = performance.now()
        const batch = queue!
        queue = undefined
        for (const cb of batch) cb(timestamp)
      })
    }
    return 0
  }
  ;(window as any).cancelAnimationFrame = () => {}

  // MessageChannel: postMessage -> setImmediate -> queueMicrotask.
  ;(window as any).MessageChannel = class MessageChannel {
    port1: any
    port2: any
    constructor() {
      this.port1 = { onmessage() {} }
      this.port2 = {
        postMessage: () => {
          setImmediate(() => {
            window.queueMicrotask(this.port1.onmessage)
          })
        },
      }
    }
  }
}
