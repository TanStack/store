import { createRoot } from 'octane'
import { createStore, useSelector } from '@tanstack/octane-store'

// Optionally, you can create stores outside of Octane components at module scope
const petStore = createStore({
  cats: 0,
  dogs: 0,
})

function App() @{
  // or define stores inside of components with hook variant. You would have to pass store as props or use store context though.
  // const petStore = useCreateStore(...)

  <main>
    <h1>Octane Store Hooks</h1>
    <p>
      This example creates a module-level store. Components read state with
      `useSelector` and update it directly with `store.setState`.
    </p>
    <CatsCard />
    <DogsCard />
    <TotalCard />
    <StoreButtons />
  </main>
}

function CatsCard() @{
  // read state slice (only re-renders when the selected value changes)
  const value = useSelector(petStore, (state) => state.cats)

  <p>Cats: {value}</p>
}

function DogsCard() @{
  // read state slice (only re-renders when the selected value changes)
  const value = useSelector(petStore, (state) => state.dogs)

  <p>Dogs: {value}</p>
}

function StoreButtons() @{
  <div>
    <button
      type="button"
      onClick={() =>
        petStore.setState((prev) => ({
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
        // directly update values in the store
        petStore.setState((prev) => ({
          ...prev,
          dogs: prev.dogs + 1,
        }))
      }
    >
      Add dog
    </button>
  </div>
}

function TotalCard() @{
  const total = useSelector(petStore, (state) => state.cats + state.dogs)

  <p>Total pets: {total}</p>
}

const target = document.getElementById('root')
if (!target) throw new Error('Missing #root')
createRoot(target).render(App)
