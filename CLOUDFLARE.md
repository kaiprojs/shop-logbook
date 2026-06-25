# Shop Logbook — Cloudflare Pages

## What this deploy includes

- **Cloudflare Pages** hosting (free, no Netlify credit limits)
- **Offline PWA** — after one online visit, the home screen app works without internet
- **Backup / Restore** via the ☰ menu (top right)

## Live URL

**https://logbookcayden.pages.dev**

## First deploy

### Option A — CLI (recommended)

```powershell
cd "c:\Users\kwatkins\Documents\fun stuff\shop-logbook"
npm install
npx wrangler login
npm run deploy:cloudflare
```

`wrangler login` opens a browser tab — approve access, then the deploy script builds and uploads `dist`.

### Option B — Dashboard upload

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. Project name: `logbookcayden`
4. Upload the **`dist`** folder contents (or unzip `logbook-dist.zip` after `npm run build`)

## Later updates

```powershell
npm run deploy:cloudflare
```

Or drag a fresh `dist` into the Cloudflare Pages dashboard.

## QR page

`public/qr.html` points at `https://logbookcayden.pages.dev`. After deploy, open `dist/qr.html` to print or screenshot the QR for Cayden.

## Cayden's phone (one time)

1. Open the **Cloudflare URL** in **Safari** (stay online ~10 seconds)
2. **Share → Add to Home Screen** → name it **Logbook**
3. ☰ menu → **Backup now** → save to Files / iCloud
4. Turn on airplane mode and open the **Logbook** icon to confirm offline works

## Moving from Netlify

If he already used `logbookcayden.netlify.app`:

1. Old URL → ☰ **Backup now** → save file
2. New Cloudflare URL → ☰ **Restore** → pick file
3. **Add to Home Screen** on the new URL
4. Remove the old Netlify home screen icon

His data is tied to the URL — backup is required when switching hosts.

## Data storage

Jobs and stock stay on **his phone** (browser storage). Cloudflare only serves the app files.
