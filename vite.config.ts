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
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons'
            }
            if (id.includes('lottie-web') || id.includes('lottie-react')) {
              return 'vendor-lottie'
            }
            if (id.includes('simple-peer') || id.includes('readable-stream')) {
              return 'vendor-webrtc'
            }
            if (id.includes('emoji-picker-react')) {
              return 'vendor-emoji'
            }
            return 'vendor-utils'
          }
        },
      },
    },
  },
})
