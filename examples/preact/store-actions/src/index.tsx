import { render } from 'preact'
import { createStore, useSelector } from '@tanstack/preact-store'

// Optionally, you can create stores outside of Preact components at module scope
const petStore = createStore(
  {
    cats: 0,
    dogs: 0,
  },
  ({ setState, get }) =>
    // optionally, define actions for updating your store in specific ways right on the store.
    ({
      addCat: () =>
        setState((prev) => ({
          ...prev,
          cats: prev.cats + 1,
        })),
      addDog: () =>
        setState((prev) => ({
          ...prev,
          dogs: prev.dogs + 1,
        })),
      log: () => console.log(get()),
    }),
)

function App() {
  // or define stores inside of components with hook variant. You would have to pass store as props or use store context though.
  // const petStore = useCreateStore(...)

  return (
    <main>
      <button type="button" onClick={petStore.actions.log}>
        Log State
      </button>
      <h1>Preact Store Actions</h1>
      <p>
        This example creates a module-level store with actions. Components read
        state with <code>useSelector</code> and call mutations through{' '}
        <code>store.actions</code>.
      </p>
      <CatVoter />
      <DogVoter />
      <TotalCard />
    </main>
  )
}

function CatVoter() {
  const cats = useSelector(petStore, (state) => state.cats)
  const { addCat } = petStore.actions

  return (
    <div>
      <p>Cats: {cats}</p>
      <button type="button" onClick={() => addCat()}>
        Vote for cats
      </button>
    </div>
  )
}

function DogVoter() {
  const dogs = useSelector(petStore, (state) => state.dogs)
  const { addDog } = petStore.actions

  return (
    <div>
      <p>Dogs: {dogs}</p>
      <button type="button" onClick={() => addDog()}>
        Vote for dogs
      </button>
    </div>
  )
}

function TotalCard() {
  const total = useSelector(petStore, (state) => state.cats + state.dogs)

  return <p>Total votes: {total}</p>
}

render(<App />, document.getElementById('app')!)
