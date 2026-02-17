---
title: Quick Start
id: quick-start
---

The basic react app example to get started with the TanStack react-store.

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createStore, useStore } from "@tanstack/react-store";

// You can instantiate the store outside of React components too!
export const store = createStore({
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

```
