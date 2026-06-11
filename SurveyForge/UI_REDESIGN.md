# Survexa Light Mode UI Redesign

Premium pastel SaaS design system applied across SurveyForge (production app).

## Design goals achieved

- Light, airy main canvas (`#F8FAFC` + soft gradient mesh)
- High-contrast typography (`#0F172A` / `#334155` / `#64748B`)
- Glassmorphism cards (`blur(20px)`, white 85% opacity)
- Pastel gradient sidebar and active nav states
- Premium primary buttons (lavender → periwinkle → cyan)
- Pastel chart palette on Analytics
- AI Generator question cards with gradient borders and type chips

## Contrast (WCAG AA)

| Pair | Ratio (approx.) |
|------|-----------------|
| Primary text `#0F172A` on `#F8FAFC` | ~16:1 |
| Secondary `#334155` on white glass | ~9:1 |
| Muted `#64748B` on `#F8FAFC` | ~5.2:1 |
| Nav active `#0F172A` on lavender gradient | ~12:1 |

Dark mode uses separate `--sf-*` tokens; toggling preserves readability.

## Modified files

### Core design system
- `src/index.css` — full token + component layer rewrite

### Layout & chrome
- `src/layouts/DashboardLayout.jsx`
- `src/components/Sidebar.jsx`
- `src/components/TopBar.jsx`
- `src/components/ui/Card.jsx`
- `src/components/ui/Button.jsx` (uses CSS classes)
- `src/components/ui/Input.jsx`
- `src/components/ui/Modal.jsx`

### Key pages
- `src/pages/dashboard/Dashboard.jsx`
- `src/pages/ai/AIQuestionGenerator.jsx`
- `src/pages/analytics/Analytics.jsx`
- `src/pages/auth/Login.jsx`

Other pages inherit global `.card`, `.btn`, `.nav-item`, `.main-canvas` automatically.

## Preview locally

```powershell
cd SurveyForge\backend; npm run dev
cd SurveyForge; npm run dev
```

Open http://localhost:5173 — toggle light mode in sidebar (moon icon).

Recommended pages to review:
- `/dashboard`
- `/ai-generator`
- `/analytics`
- `/reports`
- `/login`
