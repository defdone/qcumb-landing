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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Simplified code splitting - only split large vendors
          if (id.includes('node_modules')) {
            // Keep React together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // Keep Web3 libraries together
            if (id.includes('wagmi') || id.includes('viem') || id.includes('connectkit') || id.includes('@tanstack')) {
              return 'web3-vendor'
            }
            // Keep router separate
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            // All other vendors in one chunk
            return 'vendor'
          }
        },
      },
    },
  },
})
