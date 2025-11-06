import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/phc-helper/', // 👈 must match your GitHub repo name exactly (case-sensitive)
})
