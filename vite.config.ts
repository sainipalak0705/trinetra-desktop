import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Required for Tauri: use relative asset paths so file:// protocol works
  base: './',

  server: {
    port: 5173,
    // Tauri dev server needs a fixed strict port
    strictPort: true,
    // Listen on all interfaces so Tauri can connect
    host: process.env.TAURI_DEV_HOST || 'localhost',
  },

  // Tauri expects a fixed build output path
  build: {
    outDir: 'dist',
    // Tauri uses Chromium — we can target modern ES
    target: process.env.TAURI_ENV_PLATFORM === 'windows'
      ? ['es2021', 'chrome100']
      : ['es2021'],
    // Do not minify in debug builds for easier inspection
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // Ensure sourcemaps for Tauri debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
}))
