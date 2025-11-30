---
title: Quick Start
id: quick-start
---

The basic preact app example to get started with the TanStack preact-store.

```tsx
import { render } from "preact";
import { Store, useStore } from "@tanstack/preact-store";

// You can instantiate the store outside of Preact components too!
export const store = new Store({
  dogs: 0,
  cats: 0,
});

// This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render

const Display = ({ animal }) => {
  const count = useStore(store, (state) => state[animal]);
  return <div>{`${animal}: ${count}`}</div>;
};

const updateState = (animal) => {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    };
  });
};
const Increment = ({ animal }) => (
  <button onClick={() => updateState(animal)}>My Friend Likes {animal}</button>
);

function App() {
  return (
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
  );
}

render(<App />, document.getElementById("root"));
```

