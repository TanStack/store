import ReactDOM from 'react-dom/client'
import {
  useAtom,
  useCreateAtom,
  createStoreContext,
  useCreateStore,
  useSelector,
  useSetValue,
  useValue,
} from '@tanstack/react-store'
import type { Atom, Store } from '@tanstack/react-store'

type CounterStore = {
  cats: number
  dogs: number
}

type StoreContextValue = {
  votesStore: Store<CounterStore>
  countAtom: Atom<number>
}

const { StoreProvider, useStoreContext } =
  createStoreContext<StoreContextValue>()

// top-level app component with provider
function App() {
  const votesStore = useCreateStore<CounterStore>({
    cats: 0,
    dogs: 0,
  })
  const countAtom = useCreateAtom(0)

  return (
    <StoreProvider value={{ votesStore, countAtom }}>
      <main>
        <h1>React Store Context</h1>
        <p>
          This example provides both atoms and stores through a single typed
          context object, then consumes them from nested components.
        </p>
        <CountCard label="Cats" selector={(state) => state.cats} />
        <CountCard label="Dogs" selector={(state) => state.dogs} />
        <TotalCard />
        <StoreButtons />
        <section>
          <h2>Nested Atom Components</h2>
          <AtomSummary />
          <NestedAtomControls />
          <DeepAtomEditor />
        </section>
      </main>
    </StoreProvider>
  )
}

function CountCard({
  label,
  selector,
}: {
  label: string
  selector: (state: CounterStore) => number
}) {
  const { votesStore } = useStoreContext()
  const value = useSelector(votesStore, selector)

  return (
    <p>
      {label}: {value}
    </p>
  )
}

function TotalCard() {
  const { votesStore } = useStoreContext()
  const total = useSelector(votesStore, (state) => state.cats + state.dogs)

  return <p>Total votes: {total}</p>
}

function AtomSummary() {
  const { countAtom } = useStoreContext()
  const count = useValue(countAtom)

  return <p>Atom count: {count}</p>
}

function NestedAtomControls() {
  const { countAtom } = useStoreContext()
  const setCount = useSetValue(countAtom)

  return (
    <div>
      <button type="button" onClick={() => setCount((prev) => prev + 1)}>
        Increment atom
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset atom
      </button>
    </div>
  )
}

function DeepAtomEditor() {
  const { countAtom } = useStoreContext()
  const [count, setCount] = useAtom(countAtom)

  return (
    <div>
      <p>Editable atom count: {count}</p>
      <button type="button" onClick={() => setCount((prev) => prev + 5)}>
        Add 5 to atom
      </button>
    </div>
  )
}

function StoreButtons() {
  const { votesStore } = useStoreContext()
  const setVotes = useSetValue(votesStore)

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          setVotes((prev) => ({
            ...prev,
            cats: prev.cats + 1,
          }))
        }
      >
        Add cat
      </button>
      <button
        type="button"
        onClick={() =>
          setVotes((prev) => ({
            ...prev,
            dogs: prev.dogs + 1,
          }))
        }
      >
        Add dog
      </button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
