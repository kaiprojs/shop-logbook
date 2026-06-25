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
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Shop Logbook',
        short_name: 'Logbook',
        description: 'Bodywork shop logbook — jobs, giving, and stock',
        theme_color: '#1c2b4a',
        background_color: '#f2f2f7',
        display: 'standalone',
        start_url: base,
        icons: [
          {
            src: `${base}apple-touch-icon.png`,
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
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
