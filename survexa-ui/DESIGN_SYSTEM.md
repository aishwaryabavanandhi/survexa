# Survexa Design System

**AI-Powered Survey Platform** · Real-Time Analytics · Automated PDF Reporting

Premium mobile SaaS UI inspired by Linear, Notion, Stripe, OpenAI, Typeform, and Canva — with a unique pastel gradient identity.

---

## Brand

| Property | Value |
|----------|--------|
| Product name | **Survexa** |
| Positioning | SurveyForge-class enterprise survey intelligence |
| Personality | AI · Analytics · Automation · Productivity · Professionalism |
| Corner radius | 20–24px (`--radius-lg`, `--radius-xl`) |

---

## Color tokens

### Pastel palette (brand + charts)

| Token | Hex | Usage |
|-------|-----|--------|
| `--pastel-cyan` | `#B8F2F5` | Accents, bar chart |
| `--pastel-lavender` | `#D6C6FF` | Primary pastel, bar/pie |
| `--pastel-periwinkle` | `#C8D4FF` | Hero gradients |
| `--pastel-mint` | `#CFF8E3` | Success-adjacent, pie |
| `--pastel-peach` | `#FFD7B8` | Warm accent, bar |
| `--pastel-pink` | `#F5C3E8` | Pie segment |
| `--pastel-lemon` | `#FFF6B3` | Pie segment |

### Light mode

| Token | Value |
|-------|--------|
| Background | `#F8FAFC`, `#FFFFFF`, `#F4F7FB` |
| Cards | `#FFFFFF`, `#FCFCFD` |
| Text primary | `#0F172A` (contrast ≥ 4.5:1 on white) |
| Text secondary | `#334155` |
| Text muted | `#64748B` |

### Dark mode

| Token | Value |
|-------|--------|
| Background | `#0B1020`, `#111827`, `#161B2E` |
| Cards | `#1B2238`, `#202944` |
| Text primary | `#FFFFFF` |
| Text secondary | `#D1D5DB` |
| Text muted | `#9CA3AF` |

**Rules:** No pure black (`#000`). Glassmorphism on elevated surfaces. Gradient borders on featured cards. Pastel accents with subtle glow in dark mode.

---

## Typography

**Font:** Plus Jakarta Sans

| Scale | Size | Weight | Use |
|-------|------|--------|-----|
| Display LG | 28px | 700 | Hero titles |
| Display MD | 24px | 700 | Screen titles |
| Heading LG | 20px | 600 | Section headers |
| Heading MD | 17px | 600 | Card titles |
| Body MD | 15px | 400 | Primary copy |
| Body SM | 13px | 400 | Secondary copy |
| Caption | 11px | 400 | Meta, labels |

Letter-spacing: `-0.02em` on display styles.

---

## Spacing

4px base grid: `4, 8, 12, 16, 20, 24, 32, 40, 48`.

Screen horizontal padding: **20px** (`--space-5`).

Safe areas: top **54px**, bottom **34px** (iOS-style).

---

## Components

### Buttons

| Variant | Description |
|---------|-------------|
| **Primary** | Gradient fill (`--gradient-button`), white text, soft glow shadow |
| **Secondary** | Card background, 1px border, subtle shadow |
| **Soft** | Pastel gradient tint, bordered |
| **Ghost** | Text-only, accent color |
| **Icon** | 44×44, glass background |

Min touch target: **52px** height (primary).

### Inputs

- Height ~48px, radius 20px
- Border: `--input-border`; focus ring: 3px `--input-focus`
- OTP cells: 48×56px, centered numerals

### Cards

| Type | Style |
|------|--------|
| **Standard** | Solid `--card-bg`, `--shadow-md`, 24px radius |
| **Glass** | `backdrop-filter: blur(20px)`, semi-transparent fill |
| **Gradient border** | Pseudo-element mask with pastel gradient |
| **Float** | Hover lift `-2px` (prototype/desktop) |

### Navigation

- **Tab bar:** Blurred `--nav-bg`, 4 items, active = accent color
- **Header:** Back (40px glass button) + title + optional action
- **Status bar:** System time + indicators

### Charts (pastel only)

| Chart | Colors |
|-------|--------|
| Bar | Lavender, Cyan, Mint, Peach |
| Pie | Soft Pink, Mint, Lavender, Lemon |
| Line | Gradient `#8B9EFF` → `#B8A4FF` with area fill |

### Badges

- **AI:** Pastel gradient chip, accent text
- **Live:** Green tint background

---

## Motion

| Token | Value |
|-------|--------|
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Fast | 150ms |
| Normal | 250ms |
| Slow | 400ms |

Screen transitions: fade + 8px slide up. AI orb: subtle pulse (3s). Progress bars: width animation on load.

---

## Screen inventory (28)

1. Splash · 2. Welcome · 3. Login · 4. Signup · 5. OTP · 6. Forgot Password  
7. Dashboard · 8. Create Survey · 9. AI Question Generator · 10. Survey Builder  
11. Survey Preview · 12. Survey Sharing · 13. QR Code · 14. Response Collection  
15. Analytics Dashboard · 16. Bar Chart · 17. Pie Chart · 18. Line Chart  
19. AI Insights · 20. Recommendations · 21. PDF Preview · 22. Report Download  
23. Report Email · 24. Notifications · 25. Profile · 26. Settings  
27. Dark Mode Settings · 28. Admin Dashboard  

---

## Implementation notes

- Open `index.html` in a browser (or Live Server).
- Use the left sidebar to jump between screens; toggle **Light/Dark** at the top.
- Tokens live in `css/tokens.css`; components in `css/components.css`.
- For React Native / Flutter: map CSS variables to theme objects; keep chart hex values fixed for brand consistency.

---

## Accessibility

- Minimum **4.5:1** contrast for body text on backgrounds (verified for primary text pairs).
- Touch targets ≥ 44px.
- Focus visible on inputs (ring).
- Support **Reduce motion** toggle (Settings → Appearance).
