import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/sst/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    alias: {
      '../lib/supabase': path.resolve(__dirname, 'src/lib/__mocks__/supabase.js'),
      './lib/supabase': path.resolve(__dirname, 'src/lib/__mocks__/supabase.js'),
    },
  },
})
