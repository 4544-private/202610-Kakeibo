import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages (https://<user>.github.io/202610-Kakeibo/) 配下で動かすため base を指定
export default defineConfig({
  base: '/202610-Kakeibo/',
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'jsdom',
  },
})
