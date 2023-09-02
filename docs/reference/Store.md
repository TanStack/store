---
title: Store
id: store
---


## `Store`

A class that can be used to represent the entire application store. To create an instance of the store, you can use the constructor of the class.

```tsx
const store = new Store(initialState: TState, options?: StoreOptions<TState, TUpdater>)
```

### Constructor

- `initialState: TState`: A required paremeter to instantiate the `Store` object. It represents a store that holds and manages state and provides subscription mechanisms.
- `options?: StoreOptions<TState, TUpdater>`:  An optional parameter representing the options of the store. You can use this object to configure additional properties on your store.

### Properties

- `listeners`: A set of listeners subscribed to the store
- `state`: The current state of the store.
- `options?`: Options for configuring the store
### Methods

- `subscribe`: Subscribes a listener to the store. The method returns a function to unsubscribe the listener.
   
  ```tsx
  subscribe = (listener: Listener)
  ``` 
  - `listener` is a callback function that can be passed to subscribe to changes in the store.
  
- `setState`: Updates the store's state using the provided updater function. 
  
    ```tsx
  setState = (
    updater: TUpdater,
    opts?:{
      priority: Priority
    })
  ```
  
  - `updater: TUpdater`: a function to update the store's state.
  - `opts?`: An options object containing the update priority. Priority can be either `high` or `low`.

- `batch`: Accepts a callback function and executes a batch of operations and triggers a flush when the batch is complete
  
  ```tsx
  batch = (cb: () => void)
  ```
  
## `StoreOptions`
An interface representing the properties available to configure in Store.

### Properties

- `updateFn?`: A function to updates the current store's state.
  
  ```tsx
  updateFn?: (previous: TState) => (updater: TUpdater) => TState;
  ```
- `onSubscribe?`: A callback function called when a listener is subscribed to the store. Returns a function to unsubscribe the listener.
  ```tsx
  onSubscribe?: (
    listener: Listener,
    store: Store<TState, TUpdater>,
  ) => () => void;
  ```
- `onUpdate?`: A callback function called when the store's state is updated.
  ```tsx
  onUpdate?: (opts: { priority: Priority }) => void;
  ```
- `defaultPriority?`: The default priority to use when no priority is specified.