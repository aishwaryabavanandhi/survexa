import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyTarget = 'http://localhost:5000'
const htmlBypass = {
  target: proxyTarget,
  bypass: (req) => {
    if (req.headers.accept?.includes('html')) {
      return '/index.html'
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy all API calls to backend during development
    proxy: {
      '/auth':               htmlBypass,
      '/surveys':            htmlBypass,
      '/questions':          proxyTarget,
      '/responses':          proxyTarget,
      '/reports':            proxyTarget,
      '/generate-questions': proxyTarget,
      '/insights':           proxyTarget,
      '/ai/':                proxyTarget,
      '/public':             htmlBypass,
      '/health':             proxyTarget,
      '/admin':              htmlBypass,
      '/notifications':      proxyTarget,
      '/campaigns':          proxyTarget,
      '/billing':            htmlBypass,
      '/activity':           proxyTarget,
      '/uploads':            proxyTarget,
    },
  },
})

