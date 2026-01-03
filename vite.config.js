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
          // Ensure React loads first - critical for wagmi and other React-dependent libraries
          if (id.includes('node_modules')) {
            // React and React DOM must be together and load first
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor'
            }
            // Web3 libraries depend on React - must load after React
            if (id.includes('wagmi') || id.includes('viem') || id.includes('connectkit') || id.includes('@tanstack')) {
              return 'web3-vendor'
            }
            // Router depends on React
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            // All other vendors
            return 'vendor'
          }
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
})
