---
title: Quick Start
id: quick-start
---

The basic react app example to get started with the Tanstack react-store.

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

export const store = new Store({
  value1: 0,
  value2: 0,
});

function useAppStore(selector = (state) => state) {
  return useStore(store, selector);
}

const Display = ({ item }) => (
  <div>
    {item}: {useAppStore((state) => state[item])}
  </div>
);

const updateState = (item) => {
  store.setState((state) => {
    return {
      ...state,
      [item]: state[item] + 1,
    };
  });
};
const Increment = ({ item }) => (
  <button onClick={() => updateState(item)}>Increment {item}</button>
);

function App() {
  return (
    <div>
      <Increment item="value1" />
      <Display item="value1" />
      <Increment item="value2" />
      <Display item="value2" />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

```