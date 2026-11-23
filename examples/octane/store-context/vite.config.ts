import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [octane()],
  resolve: {
    extensions: ['.tsrx', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  build: { target: 'esnext' },
})
