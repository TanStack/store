import { load as loadRsc } from 'react-server-dom-webpack/node-loader'

export { resolve } from 'react-server-dom-webpack/node-loader'

/** @type {import('node:module').LoadHook} */
export async function load(url, context, nextLoad) {
  return loadRsc(url, context, async (specifier, nextContext) => {
    // React also loads relative source-map URLs through this callback.
    const result = await nextLoad(new URL(specifier, url).href, nextContext)

    // React's loader accepts text; Node's default loader can return bytes.
    if (result.format === 'module' && typeof result.source !== 'string') {
      return { ...result, source: new TextDecoder().decode(result.source) }
    }

    return result
  })
}
