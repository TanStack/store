---
title: Quick Start
id: quick-start
---

TanStack Store is, first and foremost, a framework-agnostic signals implementation.

It can be used with any of our framework adapters, but can also be used in vanilla JavaScript or TypeScript. It's currently used to power many of our library's internals.

## Store

You'll start by creating a new store instance, which is a wrapper around your data:

```typescript
import { createStore } from '@tanstack/store';

const countStore = createStore(0);

console.log(countStore.state); // 0
countStore.setState(() => 1);
console.log(countStore.state); // 1
```

This `Store` can then be used to track updates to your data:

```typescript
const unsub = countStore.subscribe(() => {
  console.log('The count is now:', countStore.state);
});

// Later, to cleanup
unsub();
```

### Batch Updates

You can batch updates to a store by using the `batch` function:

```typescript
import { batch } from '@tanstack/store';

// countStore.subscribers will only trigger once at the end with the final state
batch(() => {
  countStore.setState(() => 1);
  countStore.setState(() => 2);
});
```

## Derived Stores

You can create derived stores that automatically update when their dependencies change:

```typescript
const count = createStore(0);

const double = createStore(() => count.state * 2);

console.log(double.state); // 0
count.setState(() => 5);
console.log(double.state); // 10
```

### Previous Derived Value

You can access the previous value of a derived computation by using the `prev` argument passed to the function:

```typescript
const count = createStore(1);

const sum = createStore<number>((prev) => {
  return count.state + (prev ?? 0);
});

console.log(sum.state); // 1
count.setState(() => 2);
console.log(sum.state); // 3
```

## Subscriptions

You can subscribe to store changes to perform side effects:

```typescript
const count = createStore(0);

const unsubscribe = count.subscribe((state) => {
  console.log('The count is now:', state);
});

count.setState(() => 5); // Logs: "The count is now: 5"

// Later, to cleanup
unsubscribe();
```
