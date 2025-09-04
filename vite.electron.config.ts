import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    // Optimized for Electron development
    hmr: {
      port: 5173,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  plugins: [
    react(),
    // No lovable-tagger for Electron to avoid ESM conflicts
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lovable-tagger'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['lovable-tagger'],
    },
    // Optimized for Electron
    target: 'esnext',
    minify: false, // Disable minification for development
    sourcemap: true,
  },
  // Electron-specific optimizations
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
