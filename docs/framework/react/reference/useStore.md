---
title: Use Store
id: useStore
---
### `useStore`

```tsx
export function useStore<
  TState,
  TSelected = NoInfer<TState>,
  TUpdater extends AnyUpdater = AnyUpdater,
>(
  store: Store<TState, TUpdater>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
)
```

useStore is a custom hook that returns the updated store given the intial store and the selector. React can use this to keep your component subscribed to the store and re-render it on changes.



#### Parameters
- `store: Store<TState, TUpdater>`
  - This parameter represents the external store itself which holds the entire state of your application. It expects an instance of a `@tanstack/store` that manages state and supports updates through a callback.
- `selector: (state: NoInfer<TState>) => TSelected = (d) => d as any`
  - This parameter is a callback function that takes the state of the store and expects you to return a sub-state of the store. This selected sub-state is subsequently utilized as the state displayed by the useStore hook. It triggers a re-render of the component only when there are changes in this data, ensuring that updates to the displayed state trigger the necessary re-renders


