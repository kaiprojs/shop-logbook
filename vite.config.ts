import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const repo = 'shop-logbook'
const base = process.env.GITHUB_PAGES === 'true' ? `/${repo}/` : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Shop Logbook',
        short_name: 'Logbook',
        description: 'Bodywork shop logbook — jobs, giving, and stock',
        theme_color: '#1c2b4a',
        background_color: '#f6f4ef',
        display: 'standalone',
        start_url: base,
        icons: [
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}apple-touch-icon.png`,
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [new RegExp(`^${base.replace(/\//g, '\\/')}qr\\.html$`)],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
