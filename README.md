# 🗓️ Interactive Wall Calendar — Next.js

A polished, interactive wall calendar component built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## ✨ Live Demo

https://interactive-calendar-six-chi.vercel.app/
## ✨ Features

- **Wall Calendar Aesthetic** — Physical calendar design with spiral binding, hanging rings, and paper texture
- **Hero Image** — Seasonal imagery changes with theme and month navigation
- **Date Range Selector** — Click start + end date, with hover preview and visual range highlighting
- **Integrated Notes** — Add notes with optional date range labels, persisted via `localStorage`
- **4 Seasonal Themes** — Autumn 🍂, Winter ❄️, Spring 🌸, Summer ☀️ (changes accent colors + images)
- **Public Holidays** — Indian public holidays marked with gold dots
- **Month Flip Animation** — Smooth transition when navigating months
- **Fully Responsive** — Desktop side-by-side layout, mobile stacked layout
- **Today Indicator** — Current day has an accent dot beneath it
- **`localStorage` Persistence** — Notes and theme survive page refresh

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | Framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS | Utility styling |
| Lucide React | Icons |
| Unsplash | Hero images (no API key needed) |
| localStorage | Client-side persistence |

```

## 🎨 Design Decisions

- **Playfair Display** for the month heading — gives editorial, printed-calendar feel
- **CSS variables** for theming so switching seasons updates the entire UI atomically
- **42-cell grid** (6 rows × 7 cols) ensures consistent layout across all months
- Range selection uses a two-click model: first click = start, second click = end
- Hover preview shows tentative range before confirming the end date

## 📱 Responsive Behavior

- **Desktop (md+):** Side-by-side — hero image + controls on the left, calendar grid + notes on the right
- **Mobile:** Stacked vertically — image on top, grid below, notes at the bottom
