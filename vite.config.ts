import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  base: '/',
  plugins: [wasm()],
  root: './static',
  server: {
    port: 1234,
  },
  build: {
    outDir: '../dist',
  },
})
