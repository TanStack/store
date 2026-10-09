const subscribers = new Set<() => void>()
export function subscribeStorePublish(fn: () => void): () => void {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}
export function publishStore(): void {
  subscribers.forEach((fn) => {
    try { fn() } catch { /* torn-down subscriber */ }
  })
}
