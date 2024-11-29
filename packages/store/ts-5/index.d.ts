export * from '../dist/esm/effect.js'
export * from '../dist/esm/store.js'
export * from '../dist/esm/types.js'
export {
  DerivedFnProps,
  DerivedOptions,
  UnwrapDerivedOrStore,
} from '../dist/esm/derived.js'

import { Store } from '../dist/esm/store.js'
import { Derived as DerivedV4 } from '../dist/esm/derived.js'

export class Derived<
  TVal,
  const TArr extends ReadonlyArray<
    Derived<any> | Store<any>
  > = ReadonlyArray<any>,
> extends DerivedV4<TVal, TArr> {}
