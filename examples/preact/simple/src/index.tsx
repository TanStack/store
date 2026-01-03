import { render } from 'preact'
import { createAtom, useStore } from '@tanstack/preact-store'

export const store = createAtom({
  count: 0,
})

function Counter() {
  const count = useStore(store, (state) => state.count)
  return (
    <div>
      <div>Count: {count}</div>
      <button
        onClick={() => store.set((state) => ({ count: state.count + 1 }))}
      >
        Increment
      </button>
    </div>
  )
}

const root = document.body
render(<Counter />, root)
