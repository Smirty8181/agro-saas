import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const staticPreview = process.env.VITE_STATIC_PREVIEW === 'true'

export default defineConfig({
  base: staticPreview ? '/agro-saas/' : '/',
  plugins: [
    vue(),
    ...(staticPreview
      ? [{
          name: 'remove-remote-fonts-from-static-preview',
          transformIndexHtml(html: string) {
            return html.replace(/<link\b[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/g, '')
          }
        }]
      : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
