import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],

  // PWA Configuration
  build: {
    // Ensure service worker is not treated as a module
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },

  // Public directory configuration
  publicDir: 'public',

  // Server configuration
  server: {
    port: 5174,
    host: true
  }
})
