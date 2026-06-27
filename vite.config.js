import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/daily-unsplash-4k-wallpapers/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})