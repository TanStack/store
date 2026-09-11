---
title: Core Effect
id: core-effect
---

# Effect Documentation

The `Effect` class runs side effects when dependencies change, similar to `useEffect` in React.

```typescript
import { Effect } from '@tanstack/store'

const logEffect = new Effect({
  deps: [counterStore],
  fn: () => console.log('Counter changed:', counterStore.state),
  eager: true // Run immediately on creation
})
```

### Effect Options

#### `EffectOptions`
Configuration for creating effects.

```typescript
interface EffectOptions {
  deps: ReadonlyArray<Derived<any> | Store<any>> // Dependencies to watch
  fn: () => void // Effect function to run
  eager?: boolean // Whether to run immediately (default: false)
}
```

### Effect Methods

#### `mount()`
Activates the effect

```typescript
effect.mount()

```
