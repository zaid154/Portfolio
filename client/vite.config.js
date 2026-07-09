import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  envDir: '../',
  plugins: [react()],
  // Fixed dev port (5173 is taken by the local "mockmate" project). strictPort so
  // it fails loudly instead of silently drifting to another port — which would
  // break CORS, since the API only allows the CLIENT_URL origin.
  server: {
  port: 5174,
  strictPort: true,
},
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
