---
title: Quick Start
id: quick-start
---

The basic Solid app example to get started with the TanStack Solid-store.

```jsx
import { useStore, Store } from '@tanstack/solid-store';

export const store = new Store({
  cats: 0,
  dogs: 0
})

export const Display = (props) => {
  const count = useStore(store, (state) => state[props.animals]);
  return (
    <span>
      {props.animals}: {count()}
      </span>
    );
}

export const Button = (props) => {
  return (
    <button
      onClick={() => {
        store.setState((state) => {
          return {
            ...state,
            [props.animals]: state[props.animals] + 1
          }
        })
      }}
    >
      Increment
    </button>
  )
}

const App = () => {
  return (
    <div>
    <h1>How many of your friends like cats or dogs?</h1>
    <p>
      Press one of the buttons to add a counter of how many of your friends
      like cats or dogs
      </p>
      <Button animals="dogs" />
      <Display animals="dogs" />
      <Button animals="cats" />
      <Display animals="cats" />
  </div>
  );
};

export default App;
```
