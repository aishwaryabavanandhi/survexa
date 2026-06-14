# Survexa Design System

AI-powered survey platform · Premium pastel SaaS mobile UI

## Brand

**Survexa** — AI-Powered Survey Platform with Real-Time Analytics and Automated PDF Reporting

Visual identity: intelligence, automation, analytics, professionalism

## Color tokens

### Pastel palette (brand)

| Token | Hex | Usage |
|-------|-----|--------|
| `--pastel-cyan` | #B8F2F5 | Accents, charts |
| `--pastel-lavender` | #D6C6FF | Primary pastel, bars |
| `--pastel-periwinkle` | #C8D4FF | Hero gradients |
| `--pastel-mint` | #CFF8E3 | Success accents, pie |
| `--pastel-peach` | #FFD7B8 | Warm highlights, bars |
| `--pastel-pink` | #F5C3E8 | Pie charts |
| `--pastel-lemon` | #FFF6B3 | Pie charts |

### Light mode

| Token | Value |
|-------|--------|
| `--bg-primary` | #F8FAFC |
| `--bg-secondary` | #FFFFFF |
| `--bg-tertiary` | #F4F7FB |
| `--card-bg` | #FFFFFF |
| `--text-primary` | #0F172A |
| `--text-secondary` | #334155 |
| `--text-muted` | #64748B |

### Dark mode

| Token | Value |
|-------|--------|
| `--bg-primary` | #0B1020 |
| `--bg-secondary` | #111827 |
| `--bg-tertiary` | #161B2E |
| `--card-bg` | #1B2238 |
| `--card-bg-alt` | #202944 |
| `--text-primary` | #FFFFFF |
| `--text-secondary` | #D1D5DB |
| `--text-muted` | #9CA3AF |

Never use pure black (#000). Minimum contrast ratio 4.5:1 for body text.

## Typography

Font family: **Plus Jakarta Sans** (display + body), **JetBrains Mono** (data)

| Class | Size | Weight |
|-------|------|--------|
| `.display-lg` | 28px | 700 |
| `.display-md` | 24px | 700 |
| `.heading-lg` | 20px | 600 |
| `.heading-md` | 17px | 600 |
| `.body-md` | 15px | 400 |
| `.body-sm` | 13px | 400 |
| `.caption` | 11px | 400 |

## Components

- **Buttons**: `.btn-primary` (gradient), `.btn-secondary`, `.btn-soft`, `.btn-ghost`, `.btn-icon`
- **Inputs**: `.input`, `.otp-cell`, focus ring via `--input-focus`
- **Cards**: `.card`, `.card-glass`, `.card-gradient-border`, `.card-float`
- **Badges**: `.badge-ai`, `.badge-live`
- **Navigation**: `.status-bar`, `.screen-header`, `.tab-bar`
- **Charts**: bar (lavender/cyan/mint/peach), pie (pink/mint/lavender/lemon), line (blue→purple gradient)

## Radius & spacing

- Corner radius: 20–24px (`--radius-lg`, `--radius-xl`)
- Spacing scale: 4px base (`--space-1` … `--space-12`)

## Mobile screens (28)

Auth: Splash, Welcome, Login, Signup, OTP, Forgot Password  
Core: Dashboard  
Survey: Create, AI Generator, Builder, Preview, Sharing, QR, Responses  
Analytics: Dashboard, Bar, Pie, Line, AI Insights, Recommendations  
Reports: PDF Preview, Download, Email  
Account: Notifications, Profile, Settings, Dark Mode  
Admin: Admin Dashboard

## Run prototype

```bash
cd survexa-mobile
npm install
npm run dev
```

Open the gallery at `http://localhost:5173` — click any screen for fullscreen preview. Toggle light/dark mode from the header.
