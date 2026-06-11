# Survexa Mobile UI Prototype

Premium SaaS mobile application UI — **28 screens**, full design system, light & dark mode.

## Quick start

1. Open `index.html` in Chrome, Edge, or Safari.
2. Pick a screen from the left sidebar.
3. Toggle **Light / Dark** to preview both themes.

## Contents

```
survexa-ui/
├── index.html          # Interactive prototype (phone frame)
├── DESIGN_SYSTEM.md    # Tokens, typography, components
├── css/
│   ├── tokens.css      # Color, type, spacing, motion
│   ├── components.css  # Buttons, inputs, cards, charts
│   └── layout.css      # Shell + iPhone frame
└── js/
    └── app.js          # Navigation & theme
```

## Design highlights

- Pastel gradient brand palette (cyan, lavender, mint, peach, pink, lemon)
- Glassmorphism cards with gradient borders
- AI-forward patterns (orbs, insight cards, generator)
- Chart screens using palette-only colors
- App Store / investor-demo quality layout and spacing

## Export paths

- **Figma:** Import screenshots or rebuild with tokens from `DESIGN_SYSTEM.md`
- **React Native / Expo:** Copy tokens → `theme.ts`; use 390×844 frame
- **Flutter:** Map to `ThemeData` + `ColorScheme`

Built for **Survexa** — AI-powered surveys, real-time analytics, automated PDF reports.
