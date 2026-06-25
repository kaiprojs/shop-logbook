# Shop Logbook

A mobile-friendly logbook for a bodywork shop — track bookings, jobs, tithe & offering, and stock.

## Features

- **Today** — today's bookings, reschedule/cancel, ready for payment
- **Jobs** — full job list, search, filters including cancelled
- **Giving** — week (Sun–Sat) / month / year income & tithe ledger with per-job daily breakdown
- **Stock** — inventory list with low-stock alerts and adjustments

## Quick start

```bash
cd shop-logbook
npm install
npm run dev
```

## How your friend uses it

1. **Call comes in** → tap **+ New job**, enter name, phone, job, date/time
2. **Customer cancels** → **Cancel booking** (stays in history under Cancelled)
3. **Customer reschedules** → **Reschedule** → pick new date/time
4. **Job in progress** → open job, change status to Done
5. **Customer pays** → **Ready for payment** → **Record payment**
6. **Giving** tab → see tithe/offering per job by day; switch Week / Month / Year; export CSV
7. **Jobs** tab → search by name, phone, or job description

## Giving tab

- **SDA week** runs Sunday → Saturday
- Use **← →** to view past weeks (data never deletes)
- **Week / Month / Year** tabs for income totals
- **Export CSV** downloads paid jobs for the selected period

## Data storage

Data is saved in the browser's **local storage** on the device. No account or server needed.

## Hosting

**Live (GitHub Pages):** https://kaiprojs.github.io/shop-logbook/

See **[GITHUB.md](./GITHUB.md)** for deploy and Cayden migration steps.

Legacy Netlify (until Cayden migrates): https://logbookcayden.netlify.app

## Settings (defaults)

| Setting | Value |
|---------|-------|
| Tithe | 10% of each payment |
| Offering | 5% of each payment |
| Currency | BBD (BDS) |
