# SmartRoom Storage Calculator

A standalone, isolated storage calculator landing page built with **Vite + Vanilla JS**, ready for WordPress embedding.

## 🔗 Live Pages

| Page | URL |
|------|-----|
| 🏠 **Frontend** | [romanzhan2610-png.github.io/smartroom-storage/](https://romanzhan2610-png.github.io/smartroom-storage/) |
| ⚙️ **Admin Panel** | [romanzhan2610-png.github.io/smartroom-storage/admin.html](https://romanzhan2610-png.github.io/smartroom-storage/admin.html) |

## 🛠 Tech Stack

- **Build:** Vite 8
- **HTML:** Handlebars partials (`vite-plugin-handlebars`)
- **CSS:** Vanilla CSS + PostCSS + PurgeCSS
- **JS:** ES Modules (Vanilla JS, no framework)
- **Animations:** GSAP + ScrollToPlugin
- **Deploy:** `gh-pages` → GitHub Pages

## 📁 Structure

```
src/
├── index.html          # Main entry
├── admin.html          # Admin panel
├── partials/           # HTML components (header, calculator, footer…)
├── css/                # Stylesheets per component
└── js/
    ├── main.js
    └── modules/
        └── calculator/ # Calculator logic + data
```

## 🚀 Development

```bash
npm install
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build → dist/
npm run deploy    # Build + push to gh-pages branch
```

## 🔌 WordPress Integration

The project is fully isolated (no `wp-head` / `wp-footer` dependencies).  
See [`wp_integration.md`](wp_integration.md) for the architectural blueprint on embedding via a WordPress plugin + REST API.
