import ReactDOM from 'react-dom/client'
import {
  type Atom,
  useAtom,
  useCreateAtom,
  useSetValue,
  useValue,
} from '@tanstack/react-store'

function AtomValuePanel({ countAtom }: { countAtom: Atom<number> }) {
  const count = useValue(countAtom)

  return <p>Total: {count}</p>
}

function AtomButtons({ countAtom }: { countAtom: Atom<number> }) {
  const setCount = useSetValue(countAtom)

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

function AtomStepper({ countAtom }: { countAtom: Atom<number> }) {
  const [count, setCount] = useAtom(countAtom)

  return (
    <div>
      <p>Editable count: {count}</p>
      <button type="button" onClick={() => setCount((prev) => prev + 5)}>
        Add 5 with useAtom
      </button>
    </div>
  )
}

function App() {
  const countAtom = useCreateAtom(0)

  return (
    <main>
      <h1>React Atom Hooks</h1>
      <p>
        This example creates a local atom and reads and updates it with the new
        React hooks.
      </p>
      <AtomValuePanel countAtom={countAtom} />
      <AtomButtons countAtom={countAtom} />
      <AtomStepper countAtom={countAtom} />
    </main>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
