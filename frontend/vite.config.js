import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,         // expose to local network & VS Code debugger
    open: true,         // auto-open browser on npm run dev
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  },
  build: {
    sourcemap: true,    // enables proper source maps for production debug
  }
})
