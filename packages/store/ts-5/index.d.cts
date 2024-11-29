export * from '../dist/cjs/effect.js'
export * from '../dist/cjs/store.js'
export * from '../dist/cjs/types.js'
export {
  DerivedFnProps,
  DerivedOptions,
  UnwrapDerivedOrStore,
} from '../dist/cjs/derived.js'

import { Store } from '../dist/cjs/store.js'
import { Derived as DerivedV4 } from '../dist/cjs/derived.js'

export class Derived<
  TVal,
  const TArr extends ReadonlyArray<
    Derived<any> | Store<any>
  > = ReadonlyArray<any>,
> extends DerivedV4<TVal, TArr> {}
