/// <reference lib="dom" />
import type { LitElement } from 'lit'

const registered = new WeakMap<CustomElementConstructor, string>()
const mountedElements = new Set<LitElement>()
let counter = 0

/**
 * Defines a custom element under a unique tag derived from `name` and returns
 * the registered tag. Custom element registrations cannot be undone, so each
 * call with a new constructor gets a fresh tag — preventing tests from
 * unintentionally reusing a class registered by a previous test.
 */
export function defineOnce(
  name: string,
  ctor: CustomElementConstructor,
): string {
  const existing = registered.get(ctor)
  if (existing) return existing
  const tag = `${name}-${++counter}`
  window.customElements.define(tag, ctor)
  registered.set(ctor, tag)
  return tag
}

export async function mount<T extends LitElement>(tag: string): Promise<T> {
  const el = document.createElement(tag) as T
  document.body.appendChild(el)
  await el.updateComplete
  mountedElements.add(el)
  return el
}

export function cleanup() {
  for (const el of mountedElements) el.remove()
  mountedElements.clear()
}
