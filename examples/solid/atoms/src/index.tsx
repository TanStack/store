import { render } from 'solid-js/web'
import { createAtom, useAtom, useSelector } from '@tanstack/solid-store'

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
  const count = useSelector(countAtom) // useSelector with no selector re-renders when the value changes. Useful for read-only access to an atom.

  return <p>Total: {count()}</p>
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
