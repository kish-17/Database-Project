import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Ensure 404.html is copied during build
        manualChunks: undefined,
      },
    },
  },
  publicDir: 'public',
})
