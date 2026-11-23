declare module 'react-server-dom-webpack/node-loader' {
  import type { LoadHook, ResolveHook } from 'node:module'

  export const load: LoadHook
  export const resolve: ResolveHook
}
