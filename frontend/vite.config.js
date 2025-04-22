import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    },
    allowedHosts: [
      '850e0a6b-7f41-4f57-98c1-c97f07c65e45-00-2x7h55eyzcixl.worf.replit.dev',
      'lftaykikmrdfzkdjksbk.replit.dev',
      '.replit.dev'
    ]
  }
})