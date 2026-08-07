import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      events: 'events',
    },
  },
  optimizeDeps: {
    // Force Vite to pre-bundle simple-peer and its Node deps together
    // This prevents "events.EventEmitter is not a constructor" at runtime
    include: ['simple-peer'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
