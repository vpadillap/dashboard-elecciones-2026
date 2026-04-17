import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built site works under any subpath on static hosting.
export default defineConfig({
  base: './',
  plugins: [react()],
})
