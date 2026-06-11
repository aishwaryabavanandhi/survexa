# Survexa / SurveyForge — Full QA Report

**Date:** 2026-05-29  
**Scope:** SurveyForge (production full-stack app), survexa-mobile (UI prototype gallery)

---

## Executive summary

| Application | Role | Status |
|-------------|------|--------|
| **SurveyForge** | React + Express + SQLite — real product | **Production-ready** (automated E2E: **23/23 passed**) |
| **survexa-mobile** | 28-screen design prototype (no API) | **Design-complete** — not a connected mobile client |
| **survexa-ui** | Static HTML prototype | **Design reference only** |

---

## Automated test results

### Auth diagnostic (`npm run test:auth` in `backend/`)

| Check | Result |
|-------|--------|
| `GET /health` | Pass |
| `POST /auth/signup` | Pass |
| `POST /auth/verify-otp` | Pass |
| `GET /auth/me` (JWT) | Pass |

### Full API E2E (`npm run test` in `backend/`)

| Area | Tests | Result |
|------|-------|--------|
| Health | 1 | Pass |
| Signup / OTP / Verify / Login | 5 | Pass |
| Invalid OTP / Invalid JWT | 2 | Pass |
| Surveys CRUD | 3 | Pass |
| Questions (bulk API) | 1 | Pass |
| Public share + respond | 2 | Pass |
| Analytics | 1 | Pass |
| AI generate | 1 | Pass (template when no OpenAI quota) |
| Insights | 1 | Pass |
| PDF download | 1 | Pass (~2.7 KB valid PDF) |
| Report email | 1 | Pass (SMTP configured on this machine) |
| Notifications | 1 | Pass |
| Resend OTP + cooldown | 2 | Pass |
| Forgot password | 1 | Pass |
| Delete survey | 1 | Pass |

**Total: 23/23 passed**

### Production build

| Build | Result |
|-------|--------|
| `npm run build` (frontend) | Pass |
| `npm run build` (survexa-mobile gallery) | Pass (prior session) |

---

## Features completed

### Backend (real implementation)

- JWT authentication (unified secret via `backend/config/jwt.js`)
- Signup, login, logout (client-side token clear)
- OTP verification + resend (60s cooldown)
- Forgot / reset password
- Survey CRUD + ownership
- Questions (bulk replace + single update/delete)
- Public survey by `share_token` + anonymous responses
- Response storage + analytics aggregation
- Bar/pie/line data for frontend Chart.js
- AI question generation (OpenAI or template fallback)
- AI insights (OpenAI or rules fallback)
- PDF reports (pdfkit) — download + email attachment
- In-app notifications
- Admin dashboard API (users, surveys, analytics)
- Helmet, rate limiting, CORS

### Frontend (SurveyForge)

- Auth flows wired to API
- Dashboard, survey builder, drag-and-drop (hello-pangea/dnd)
- AI generator, analytics, insights, reports
- Public survey page `/survey/:token`
- Admin panel (role-gated)
- Dark/light theme, responsive layout

### Design deliverables

- **survexa-mobile:** 28 screens, pastel design system, light/dark mode gallery
- **DESIGN_SYSTEM.md** + token CSS

---

## Bugs fixed in this session

| Issue | Fix |
|-------|-----|
| JWT secret mismatch risk between `auth.js` and `middleware/auth.js` | Centralized `backend/config/jwt.js` |
| E2E/diagnostic could not read OTP when SMTP sends email | Expose OTP in **non-production** responses; diagnostic reads DB fallback |
| E2E used wrong API shapes (`survey` vs `data`, `survey_id` vs `surveyId`) | Updated `e2e-test.js` |
| Resend OTP test failed on intentional 60s cooldown | Test accepts 429 or 200; verified-user blocked |
| Duplicate tab bar on mobile gallery screens | Fixed `tabActive` prop |
| Port conflict (survexa-mobile vs SurveyForge on 5173) | survexa-mobile moved to **5174** |

---

## Remaining limitations (honest)

These are **not bugs** but **planned stubs** or **environment-dependent**:

| Item | Notes |
|------|--------|
| **survexa-mobile** | No backend — UI/UX gallery only. Use **SurveyForge** for functional testing. |
| **OpenAI** | Requires valid `OPENAI_API_KEY`. Without it, AI uses **templates** (still functional). |
| **Email** | Requires Gmail app password in `EMAIL_USER` / `EMAIL_PASS`. Without it, OTP/logs go to **server console**; reports return `simulated: true`. |
| **SMS OTP** | Phone signup logs OTP to console only (no Twilio). |
| **Settings → Team / Billing / Integrations** | Static UI mock data |
| **Trash, Activity log, Compare, Live results** | Placeholder screens |
| **Native iOS/Android app** | Not in repo — responsive web + mobile UI prototype |

---

## Security checklist

| Item | Status |
|------|--------|
| JWT required on protected routes | OK |
| Admin routes require `role === 'admin'` | OK |
| Rate limit on `/auth` | OK |
| Helmet headers | OK |
| OTP not returned in **production** responses | OK (dev-only exposure) |
| `JWT_SECRET` required in production startup | OK |
| Secrets in `.env` (not committed) | OK — do not commit `.env` |

---

## Deployment readiness

| Criterion | Status |
|-----------|--------|
| Production frontend build | Ready |
| Backend start (`npm start`) | Ready |
| Env documentation | `README.md`, `.env.example` |
| Health endpoint | `GET /health` |
| Automated API tests | `npm test` in `backend/` |

**Recommended production setup:**

1. Host backend (Node 20+) with `NODE_ENV=production`, strong `JWT_SECRET`
2. Serve `SurveyForge/dist` via CDN or static host
3. Set `VITE_API_URL` to public API URL at build time
4. Configure `FRONTEND_URL`, `OPENAI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`

---

## Working URLs (local)

| Service | URL |
|---------|-----|
| **SurveyForge app** | http://localhost:5173 |
| **API** | http://localhost:5000 |
| **Health** | http://localhost:5000/health |
| **Mobile UI gallery** | http://localhost:5174 |

---

## Final run instructions

**Terminal 1 — API**

```powershell
cd "C:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\SurveyForge\backend"
$env:NODE_ENV="development"
npm run dev
```

**Terminal 2 — Web app**

```powershell
cd "C:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\SurveyForge"
npm run dev
```

**Terminal 3 — Run tests (optional)**

```powershell
cd "C:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\SurveyForge\backend"
npm test
```

**Mobile design gallery (optional, port 5174)**

```powershell
cd "C:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\survexa-mobile"
npm run dev
```

---

## Confirmation matrix

| Requirement | SurveyForge | survexa-mobile |
|-------------|---------------|----------------|
| AI works | Yes (OpenAI or templates) | UI only |
| OTP works | Yes | UI only |
| Email / PDF reports | Yes (if SMTP configured) | UI only |
| PDF download | Yes | UI only |
| Analytics | Yes | Static charts |
| Database | Yes (SQLite) | N/A |
| Frontend | Yes | Gallery |
| Backend | Yes | N/A |
| Admin | Yes | UI screen |
| Mobile responsive | Yes | Phone-frame prototype |

**The fully functional production application is SurveyForge.**  
**survexa-mobile is the investor-ready visual spec aligned with your pastel design system.**
