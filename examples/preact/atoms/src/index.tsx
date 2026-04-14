import { render } from 'preact'
import {
  createAtom,
  useAtom,
  // useCreateAtom,
  useValue,
} from '@tanstack/preact-store'

// Optionally, you can create atoms outside of Preact components at module scope
const countAtom = createAtom(0)

function App() {
  // or define atoms inside of components with hook variant. You would have to pass atom as props or use store context though.
  // const countAtom = useCreateAtom(0)

  return (
    <main>
      <h1>Preact Atom Hooks</h1>
      <p>
        This example creates a module-level atom and reads and updates it with
        the Preact hooks.
      </p>
      <AtomValuePanel />
      <AtomButtons />
      <AtomStepper />
    </main>
  )
}

function AtomValuePanel() {
  const count = useValue(countAtom) // useValue re-renders when the value changes. Useful for read-only access to an atom.

  return <p>Total: {count}</p>
}

function AtomButtons() {
  return (
    <div>
      <button type="button" onClick={() => countAtom.set((prev) => prev + 1)}>
        Increment
      </button>
      <button type="button" onClick={() => countAtom.set(0)}>
        Reset
      </button>
    </div>
  )
}

function AtomStepper() {
  const [count, setCount] = useAtom(countAtom) // read and write access to the atom. Re-renders when the value changes.

  return (
    <div>
      <p>Editable count: {count}</p>
      <button type="button" onClick={() => setCount((prev) => prev + 5)}>
        Add 5 with useAtom
      </button>
    </div>
  )
}

render(<App />, document.getElementById('app')!)
