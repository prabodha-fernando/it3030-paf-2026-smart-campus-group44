import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api':                    { target: 'http://localhost:8080', changeOrigin: true },
      '/ws':                     { target: 'ws://localhost:8080', ws: true, changeOrigin: true },
      '/oauth2/authorization':   { target: 'http://localhost:8080', changeOrigin: true },
      '/login/oauth2':           { target: 'http://localhost:8080', changeOrigin: true }
      
    }
  }
})
