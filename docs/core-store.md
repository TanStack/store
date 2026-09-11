---
title: Core Store
id: core-store
---

# TanStack Store Documentation

A reactive state management library with derived values, effects, and batched updates.

## Core Concepts

### Store

The `Store` class is the fundamental building block for managing state. It provides reactive state management with subscription capabilities and integrates with the batching system for optimal performance

```typescript
import { Store } from '@tanstack/store'

// Create a store with initial state
const counterStore = new Store(0)

counterStore.setState(prev => prev + 1)
```
**Key Features:**
- **Reactive State Management**: Automatically notifies listeners when state changes
- **Custom Update Functions**: Support for custom state update logic
- **Lifecycle Hooks**: Callbacks for subscription and update events
- **Previous State Tracking**:Access to both current and previous state values

## Store Options

### `StoreOptions<TState, TUpdater>`
Configuration object for customizing store behavior.

```typescript
interface StoreOptions<TState, TUpdater> {
  updateFn?: (previous: TState) => (updater: TUpdater) => TState // Custom update function
  onSubscribe?: (listener: Listener<TState>, store: Store<TState, TUpdater>) => () => void // Called when listener subscribes
  onUpdate?: () => void // Called after state updates
}
```

**Example with options:**
```typescript
const customStore = new Store(0, {
  updateFn: (prev) => (updater) => {
    // Custom update logic - e.g., validation, transformation
    const newValue = updater(prev)
    return Math.max(0, newValue) // Ensure value is never negative
  },
  onSubscribe: (listener, store) => {
    console.log('New subscriber added')
    return () => console.log('Subscriber removed')
  },
  onUpdate: () => {
    console.log('Store updated:', customStore.state)
  }
})
```



## Core Types

### `AnyUpdater`
```typescript
type AnyUpdater = (prev: any) => any
```
Function type for state updates that receive the previous value and return the new value.

### `Listener<T>`
```typescript
type Listener<T> = (value: ListenerValue<T>) => void

interface ListenerValue<T> {
  prevVal: T
  currentVal: T
}
```
Function type for subscribing to state changes. Receives both previous and current values.

## Store Methods

### `setState(updater)`
Updates the store's state, triggers the update lifecycle, and flushes changes through the batching system.

```typescript
// Function updater (recommended)
store.setState(prev => prev + 1)

```

**Behavior:**
- Updates `prevState` to the current `state`
- Computes new state using the updater function or custom `updateFn`
- Calls `onUpdate` callback if provided
- Triggers the flush mechanism to update derived values and notify listeners

### `subscribe(listener)`
Subscribes to state changes and returns an unsubscribe function.

```typescript
store.subscribe(({ prevVal, currentVal }) => {
  console.log(`Changed from ${prevVal} to ${currentVal}`)
})

```

**Behavior:**
- Adds listener to the store's listener set
- Calls `onSubscribe` callback if provided

## Batching Integration

The Store class works seamlessly with the `batch` function to optimize performance in complex update scenarios.

### `batch(fn)`
Groups multiple state updates to prevent intermediate calculations and cascade updates.

```typescript
import { batch } from '@tanstack/store'

const store1 = new Store(0)
const store2 = new Store(10)

// Without batching - triggers updates twice
store1.setState(prev => prev + 1) // Derived values recalculate
store2.setState(prev => prev * 2) // Derived values recalculate again

// With batching - triggers updates only once at the end
batch(() => {
  store1.setState(prev => prev + 1)
  store2.setState(prev => prev * 2)
  // All derived values recalculate only once after both updates
})
```

**How batching works with stores:**
1. During batch, `setState` calls are queued instead of immediately flushed
2. Store listeners are notified with the initial pre-batch values as `prevVal`
3. Derived values are recalculated only once after all batched updates complete
4. This prevents the diamond dependency problem and improves performance

## Usage Examples

### Basic Counter
```typescript
const counterStore = new Store(0)

// Subscribe to changes
const unsubscribe = counterStore.subscribe(({ prevVal, currentVal }) => {
  console.log(`Counter: ${prevVal} → ${currentVal}`)
})

// Update the counter
counterStore.setState(prev => prev + 1) // Logs: "Counter: 0 → 1"
counterStore.setState(prev => prev + 5) // Logs: "Counter: 1 → 6"
```

### Store with Validation
```typescript
const validatedStore = new Store('', {
  updateFn: (prev) => (updater) => {
    const newValue = updater(prev)
    // Only allow non-empty strings
    return newValue.trim() || prev
  },
  onUpdate: () => {
    if (validatedStore.state.length > 0) {
      console.log('Valid input:', validatedStore.state)
    }
  }
})

validatedStore.setState(() => '  ') // Rejected, stays empty
validatedStore.setState(() => 'Hello') // Accepted: "Hello"
```

### Complex State Updates with Batching
```typescript
const userStore = new Store({ name: '', age: 0 })
const settingsStore = new Store({ theme: 'light', notifications: true })

// Update multiple stores efficiently
batch(() => {
  userStore.setState(prev => ({ ...prev, name: 'John', age: 25 }))
  settingsStore.setState(prev => ({ ...prev, theme: 'dark' }))
  // Any derived values depending on both stores update only once
})
```

## Best Practices

### 1. Use Function Updaters
```typescript
// ✅ Good: Safe and predictable
store.setState(prev => prev + 1)

// ❌ Avoid: Direct mutations
store.state++ // This won't trigger updates
```

### 2. Batch Related Updates
```typescript
// ✅ Good: Single update cycle
batch(() => {
  store1.setState(prev => prev + 1)
  store2.setState(prev => prev * 2)
})

// ❌ Less efficient: Multiple update cycles
store1.setState(prev => prev + 1)
store2.setState(prev => prev * 2)
```


### 3. Use onUpdate for Side Effects
```typescript
// ✅ Good: Centralized side effects
const store = new Store(data, {
  onUpdate: () => {
    // Save to localStorage, sync with server, etc.
    localStorage.setItem('data', JSON.stringify(store.state))
  }
})
```
