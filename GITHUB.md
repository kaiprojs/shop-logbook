# Shop Logbook — GitHub Pages

## Live URL

**https://YOUR_USERNAME.github.io/shop-logbook/**

(Replace `YOUR_USERNAME` with your GitHub username after the first deploy.)

Legacy Netlify (until Cayden migrates): **https://logbookcayden.netlify.app**

## What this deploy includes

- **GitHub Pages** hosting (free, no Netlify credit limits)
- **Offline PWA** — after one online visit, the home screen app works without internet
- **Backup / Restore** via the ☰ menu (top right)
- **Auto deploy** on every push to `main`

## Deploy updates

Push to `main` — GitHub Actions builds and publishes automatically.

Local check before pushing:

```powershell
npm run build:pages
```

## QR page

After deploy, open `dist/qr.html` (after `npm run build:pages`) to print or screenshot the QR for Cayden.

## Cayden's phone (one time)

1. If he used Netlify before: old URL → ☰ **Backup now** → save file
2. Open the **GitHub Pages URL** in **Safari** (stay online ~10 seconds)
3. ☰ **Restore** → pick backup file (if migrating)
4. **Share → Add to Home Screen** → name it **Logbook**
5. Remove the old Netlify home screen icon
6. Turn on airplane mode and open **Logbook** to confirm offline works

His data is tied to the URL — backup is required when switching hosts.

## Data storage

Jobs and stock stay on **his phone** (browser storage). GitHub only serves the app files.
