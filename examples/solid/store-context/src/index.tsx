import { createContext, useContext } from 'solid-js'
import { render } from 'solid-js/web'
import {
  createAtom,
  createStore,
  useAtom,
  useSelector,
  useValue,
} from '@tanstack/solid-store'
import type { Atom, Store } from '@tanstack/solid-store'

// one drawback of storing stores and atoms in context is you have to define types for the context manually, instead of everything being inferred.

type CounterStore = {
  cats: number
  dogs: number
}

type StoreContextValue = {
  votesStore: Store<CounterStore>
  countAtom: Atom<number>
}

const StoreContext = createContext<StoreContextValue>()

function useStoreContext() {
  const value = useContext(StoreContext)

  if (!value) {
    throw new Error('Missing StoreProvider for StoreContext')
  }

  return value
}

function App() {
  // Solid components only run once per mount, so stores and atoms created here stay stable for this provider instance.
  const votesStore = createStore<CounterStore>({
    cats: 0,
    dogs: 0,
  })
  const countAtom = createAtom(0)

  return (
    <StoreContext.Provider value={{ votesStore, countAtom }}>
      <main>
        <h1>Solid Store Context</h1>
        <p>
          This example provides both atoms and stores through a single typed
          context object, then consumes them from nested components.
        </p>
        <CatCard />
        <DogCard />
        <TotalCard />
        <StoreButtons />
        <section>
          <h2>Nested Atom Components</h2>
          <AtomSummary />
          <NestedAtomControls />
          <DeepAtomEditor />
        </section>
      </main>
    </StoreContext.Provider>
  )
}

function CatCard() {
  // pull a store from context
  const { votesStore } = useStoreContext()
  // select a value from the store with useSelector
  const value = useSelector(votesStore, (state) => state.cats)

  return <p>Cats: {value()}</p>
}

function DogCard() {
  // pull a store from context
  const { votesStore } = useStoreContext()
  // select a value from the store with useSelector
  const value = useSelector(votesStore, (state) => state.dogs)

  return <p>Dogs: {value()}</p>
}

function TotalCard() {
  // pull a store from context
  const { votesStore } = useStoreContext()
  // custom selector to calculate total votes from the store state
  const total = useSelector(votesStore, (state) => state.cats + state.dogs)

  return <p>Total votes: {total()}</p>
}

function AtomSummary() {
  // pull an atom from context
  const { countAtom } = useStoreContext()
  const count = useValue(countAtom)

  return <p>Atom count: {count()}</p>
}

function NestedAtomControls() {
  const { countAtom } = useStoreContext()

  return (
    <div>
      <button type="button" onClick={() => countAtom.set((prev) => prev + 1)}>
        Increment atom
      </button>
      <button type="button" onClick={() => countAtom.set(0)}>
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
      <p>Editable atom count: {count()}</p>
      <button type="button" onClick={() => setCount((prev) => prev + 5)}>
        Add 5 to atom
      </button>
    </div>
  )
}

function StoreButtons() {
  const { votesStore } = useStoreContext()

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          votesStore.setState((prev) => ({
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
          votesStore.setState((prev) => ({
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

render(() => <App />, document.getElementById('root')!)
