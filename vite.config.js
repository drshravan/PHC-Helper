import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'PHC Helper',
        short_name: 'PHC Helper',
        description: 'Comprehensive Medical Roadmap & Calculator',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        scope: '/PHC-Helper/',
        start_url: '/PHC-Helper/',
        orientation: 'portrait',
        icons: [
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/PHC-Helper/',
})
