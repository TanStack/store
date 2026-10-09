import type { Atom, Store } from '@tanstack/store'

export function ServerView(props: {
  store: Store<{ count: number }>
  atom: Atom<number>
}): unknown
