import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import { resolve } from 'path'

const isGithubPages = process.env.GITHUB_PAGES === 'true'
const repoName = process.env.REPO_NAME || 'tfg_code'

export default defineConfig({
  base: isGithubPages ? `/${repoName}/` : './',
  plugins: [wasm()],
  root: './static',
  server: {
    port: 1234,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'static/index.html'),
        about: resolve(__dirname, 'static/about.html'),
      },
    },
  },
})
