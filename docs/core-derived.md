---
title: Core Derived
id: core-derived
---

# Derived Documentation


The `Derived` class creates computed values that automatically update when their dependencies change. This solves the diamond dependency problem through intelligent batching and dependency tracking.

```typescript
import { Derived } from '@tanstack/store'

const doubled = new Derived({
  deps: [counterStore],
  fn: () => counterStore * 2
})
```

**Key Features:**
- **Automatic Updates**: Recalculates when dependencies change
- **Diamond Dependency Resolution**: Prevents duplicate calculations in complex dependency graphs
- **Lazy Evaluation**: Only computes when subscribed to or explicitly mounted
- **Lazy Evaluation**:Access to both current and previous values of dependencies and the derived value itself




### Derived Options

#### `DerivedOptions<TState, TArr>`
Configuration object for creating derived values.

```typescript
interface DerivedOptions<TState, TArr> {
  deps: TArr // Array of Store or Derived dependencies
  fn: (props: DerivedFnProps<TArr>) => TState // Computation function
  onSubscribe?: (listener: Listener<TState>, derived: Derived<TState>) => () => void
  onUpdate?: () => void // Called after each recomputation
}
```

#### `DerivedFnProps<TArr>`
Props passed to the derived computation function.

```typescript
interface DerivedFnProps<TArr> {
  prevVal: unknown | undefined // Previous derived value (undefined on first run)
  prevDepVals: TUnwrappedArr | undefined // Previous dependency values
  currDepVals: TUnwrappedArr // Current dependency values
}
```

Example with previous values:

```typescript
const changeTracker = new Derived({
  deps: [counterStore],
  fn: ({ currDepVals, prevDepVals, prevVal }) => {
    const currentCounter = currDepVals[0]
    const prevCounter = prevDepVals?.[0]
 

    return {
      current: currentCounter,
      previous: prevCounter,
      hasChanged: prevCounter !== currentCounter,
      previousResult: prevVal
    }
  }
})
```

### Derived Methods

#### `mount()`
Registers the derived value in the dependency graph and returns cleanup function.

```typescript
derived.mount()
```

#### `recompute()`
Manually triggers recomputation of the derived value.

```typescript
derived.recompute()
```

#### `subscribe(listener)`
Subscribes to derived value changes.

```typescript
const unsubscribe = derived.subscribe(({ prevVal, currentVal }) => {
  // Handle derived value change
})
```

#### `checkIfRecalculationNeededDeeply()`
Recursively checks all derived dependencies and recomputes if any dependency values have changed..

```typescript
derived.checkIfRecalculationNeededDeeply()
```

#### `registerOnGraph(deps?)
Registers this derived value in the dependency graph with specified dependencies (defaults to this.options.deps).


```typescript
derived.registerOnGraph()
// or with custom deps
derived.registerOnGraph([customStore])
```


#### `unregisterFromGraph(deps?)`
Removes this derived value from the dependency graph for specified dependencies.

```typescript
derived.unregisterFromGraph()

```
