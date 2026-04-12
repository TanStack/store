import { render } from 'solid-js/web'
import {
  createAtom,
  useAtom,
  useSetValue,
  useValue,
} from '@tanstack/solid-store'

// Optionally, you can create atoms outside of Solid components at module scope
const countAtom = createAtom(0)

function App() {
  return (
    <main>
      <h1>Solid Atom Hooks</h1>
      <p>
        This example creates a module-level atom and reads and updates it with
        the Solid hooks.
      </p>
      <AtomValuePanel />
      <AtomButtons />
      <AtomStepper />
    </main>
  )
}

function AtomValuePanel() {
  const count = useValue(countAtom) // useValue re-renders when the value changes. Useful for read-only access to an atom.

  return <p>Total: {count()}</p>
}

function AtomButtons() {
  const setCount = useSetValue(countAtom) // useSetValue avoids wiring the current value into this component when you only need writes.

  return (
    <div>
      <button type="button" onClick={() => setCount((prev) => prev + 1)}>
        Increment with useSetValue
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset with useSetValue
      </button>
    </div>
  )
}

function AtomStepper() {
  const [count, setCount] = useAtom(countAtom) // read and write access to the atom.

  return (
    <div>
      <p>Editable count: {count()}</p>
      <button type="button" onClick={() => setCount((prev) => prev + 5)}>
        Add 5 with useAtom
      </button>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
