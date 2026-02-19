import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

const isGithubPages = process.env.GITHUB_PAGES === 'true'
const repoName = process.env.REPO_NAME || 'tfg-code'

export default defineConfig({
  base: isGithubPages ? `/${repoName}/` : '/',
  plugins: [wasm()],
  root: './static',
  server: {
    port: 1234,
  },
  build: {
    outDir: '../dist',
  },
})
