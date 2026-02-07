import { render } from 'preact'
import { Store, useStore } from '@tanstack/preact-store'

export const store = new Store({
  count: 0,
})

function Counter() {
  const count = useStore(store, (state) => state.count)
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => store.setState((s) => ({ count: s.count + 1 }))}>
        Increment
      </button>
    </div>
  )
}

const root = document.body
render(<Counter />, root)
