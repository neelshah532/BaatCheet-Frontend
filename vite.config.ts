import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.browser': true,
    'process.nextTick': 'globalThis.setTimeout',
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
    // This prevents "events.EventEmitter is not a constructor" and _readableState undefined at runtime
    include: ['simple-peer', 'stream-browserify', 'events', 'process'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env': '{}',
        'process.browser': 'true',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
