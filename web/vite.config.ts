import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5180,
    strictPort: true,
    host: true,
    proxy: {
      '/pdf-proxy': {
        target: 'https://fatwamui.com/storage',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf-proxy/, ''),
        headers: {
          Referer: 'https://fatwamui.com/'
        }
      }
    }
  }
})
