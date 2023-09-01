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

useStore is a custom hook that returns the updated store given the intial store and the selector.


These are generic type parameters for the useStore function:
`<TState, TSelected = NoInfer<TState>, TUpdater extends AnyUpdater = AnyUpdater>`

- `TState`: This parameter represents the type of your application's state. You are expected to provide the specific state type when you call the useStore function.

- `TSelected = NoInfer<TState>`: This parameter represents the selected portion of the state. By default, it is set to NoInfer<TState>, which means it will infer the type from TState. You can override this default by explicitly specifying TSelected when calling the function.

- `TUpdater extends AnyUpdater = AnyUpdater`: This parameter represents the type of updater functions or actions used to modify the state. It extends a type called AnyUpdater, and AnyUpdater is set as the default. Like TSelected, you can override this default by specifying TUpdater explicitly when calling the function

#### Properties
- `store: Store<TState, TUpdater>`
  - This parameter represents the state management store itself. It expects an instance of a store that manages state of type TState and supports updates through functions or actions of type `TUpdater`.
- `selector: (state: NoInfer<TState>) => TSelected = (d) => d as any`
  - This parameter is a selector function that takes the current state (of type TState or a subtype inferred from it) and returns the selected portion of the state (of type TSelected). The default behavior of this selector function is to return its input unchanged ((d) => d as any). You can provide a custom selector function to extract specific data from your state..
