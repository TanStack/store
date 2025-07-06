---
title: Quick Start
id: quick-start
---

TanStack Store is, first and foremost, a framework-agnostic signals implementation.

It can be used with any of our framework adapters, but can also be used in vanilla JavaScript or TypeScript. It's currently used to power many of our library's internals.

## Store

You'll start by creating a new store instance, which is a wrapper around your data:

```typescript
import { Store } from '@tanstack/store';

const countStore = new Store(0);

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

You can even transform the data before it's updated:

```typescript
const count = new Store(12, {
  updateFn: (prevValue) => (updateValue) => {
    return updateValue(prevValue) + previous;
  }
});

count.setState(() => 12);
// count.state === 24
```

And implement a primitive form of derived state:

```typescript
let double = 0;
const count = new Store(0, {
  onUpdate: () => {
    double = count.state * 2;
  }
})
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

## Derived

You can also use the `Derived` class to create derived values that lazily update when their dependencies change:

```typescript
const count = new Store(0);

const double = new Derived({
  fn: () => count.state * 2,
  // Must explicitly list dependencies
  deps: [count]
});

// Must mount the derived value to start listening for updates
const unmount = double.mount();

// Later, to cleanup
unmount();
```

### Previous Derived Value

You can access the previous value of a derived computation by using the `prevVal` argument passed to the `fn` function:

```typescript
const count = new Store(1);

const double = new Derived({
  fn: ({ prevVal }) => {
    return count.state + (prevVal ?? 0);
  },
  deps: [count]
});

double.mount();
double.state; // 1
count.setState(() => 2);
double.state; // 3
```

### Dependency Values

You can access the values of the dependencies of a derived computation by using the `prevDepVals` and `currDepVals` arguments passed to the `fn` function:

```typescript
const count = new Store(1);

const double = new Derived({
  fn: ({ prevDepVals, currDepVals }) => {
    return (prevDepVals[0] ?? 0) + currDepVals[0];
  },
  deps: [count]
});

double.mount();
double.state; // 1
count.setState(() => 2);
double.state; // 3
```

## Effects

You can also use the `Effect` class to manage side effects across multiple stores and derived values:

```typescript
const effect = new Effect({
  fn: () => {
    console.log('The count is now:', count.state);
  },
  // Array of `Store`s or `Derived`s
  deps: [count],
  // Should effect run immediately, default is false
  eager: true
})

// Must mount the effect to start listening for updates
const unmount = effect.mount();

// Later, to cleanup
unmount();
```
