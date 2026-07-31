---
title: Quick Start
id: quick-start
---

The basic Octane app example to get started with TanStack `octane-store`.

Install the adapter alongside Octane:

```sh
npm install @tanstack/octane-store octane
```

Configure the Octane compiler in Vite and include `.tsrx` in the resolved
extensions:

```ts
import { defineConfig } from 'vite'
import { octane } from 'octane/compiler/vite'

export default defineConfig({
  plugins: [octane()],
  resolve: {
    extensions: ['.tsrx', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  build: { target: 'esnext' },
})
```

Then create the app in a `.tsrx` file:

```tsx
import { createRoot } from 'octane'
import { createStore, useSelector } from '@tanstack/octane-store'

// You can instantiate the store outside of Octane components too!
export const store = createStore({
  dogs: 0,
  cats: 0,
})

interface DisplayProps {
  animal: 'dogs' | 'cats'
}

// This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render
function Display(props: DisplayProps) @{
  const count = useSelector(store, (state) => state[props.animal])
  <div>{`${props.animal}: ${count}`}</div>
}

const updateState = (animal: 'dogs' | 'cats') => {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    }
  })
}

function Increment(props: DisplayProps) @{
  <button onClick={() => updateState(props.animal)}>
    My Friend Likes {props.animal}
  </button>
}

function App() @{
  <div>
    <h1>How many of your friends like cats or dogs?</h1>
    <p>
      Press one of the buttons to add a counter of how many of your friends
      like cats or dogs
    </p>
    <Increment animal="dogs" />
    <Display animal="dogs" />
    <Increment animal="cats" />
    <Display animal="cats" />
  </div>
}

const target = document.getElementById('root')
if (!target) throw new Error('Missing #root')
createRoot(target).render(App)
```

`useStore` remains available as a deprecated alias to `useSelector`.
