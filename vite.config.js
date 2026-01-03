import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    // Disable code splitting to ensure React is always available before wagmi
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
