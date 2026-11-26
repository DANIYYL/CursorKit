import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes the build work on any GitHub Pages path (user.github.io/<repo>/).
// minify is off because the live code panel reads this page's own CSS and JS.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { minify: false, cssMinify: false },
})
