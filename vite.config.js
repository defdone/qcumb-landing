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
          // Split vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('wagmi') || id.includes('viem') || id.includes('connectkit')) {
              return 'web3-vendor'
            }
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            // Other node_modules
            return 'vendor'
          }
        },
      },
    },
    css: {
      minify: 'esbuild',
    },
  },
})
