# SurveyForge

Full-stack survey builder: React (Vite) frontend and Express + SQLite backend with JWT auth, OTP signup, AI-assisted questions, analytics, reports (PDF), and public share links.

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** (comes with Node)

---

## Setup

### 1. Clone and install dependencies

```bash
cd SurveyForge
npm install
cd backend
npm install
cd ..
```

### 2. Environment variables

Copy the example files and edit values:

| File | Purpose |
|------|---------|
| `SurveyForge/.env` | Frontend (Vite) |
| `SurveyForge/backend/.env` | Backend API |

```bash
copy .env.example .env
cd backend
copy .env.example .env
cd ..
```

*(On macOS/Linux use `cp` instead of `copy`.)*

#### Frontend — `.env` (project root)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | API base URL. Default: `http://localhost:5000` |

#### Backend — `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port. Default: `5000` |
| `NODE_ENV` | No | `development` or `production` |
| `JWT_SECRET` | **Yes** (prod) | Secret for signing JWTs; use a long random string in production |
| `FRONTEND_URL` | Recommended | Allowed CORS origin and password-reset links (e.g. `http://localhost:5173`) |
| `OPENAI_API_KEY` | No | If set (non-placeholder), **AI Question Generator** and **Insights** call OpenAI (`gpt-4o-mini`). If unset, the generator uses built-in **templates** derived from your topic (still saved as real surveys). |
| `EMAIL_USER` | No | Gmail address for OTP / password-reset mail |
| `EMAIL_PASS` | No | Gmail **App Password** (not your normal password) |

Without `EMAIL_USER` / `EMAIL_PASS`, OTP and reset flows still work: codes and links are printed to the backend console.

---

## Run

Use **two terminals** (backend first is recommended).

**Windows PowerShell:** use `;` between commands, not `&&` (e.g. `cd backend; npm run dev`). If the backend fails with **`EADDRINUSE`** on port **5000**, another process is using that port—stop it or close an old backend terminal.

### Backend

```bash
cd SurveyForge/backend
npm run dev
```

- API: `http://localhost:5000` (or your `PORT`)
- Health: `http://localhost:5000/health`

### Frontend

```bash
cd SurveyForge
npm run dev
```

- App: `http://localhost:5173` (Vite default)

Ensure `FRONTEND_URL` / CORS matches the URL Vite prints if you use a non-default port.

### Production build (frontend only)

```bash
cd SurveyForge
npm run build
npm run preview
```

Backend: `cd backend; npm start` (PowerShell) or `cd backend && npm start` (bash); runs `node server.js`.

---

## Project layout

```
SurveyForge/
├── src/                 # React app (routes, pages, components, api client)
├── public/
├── backend/
│   ├── server.js        # Express entry
│   ├── routes/          # Auth, surveys, questions, responses, …
│   ├── middleware/
│   ├── utils/
│   └── database.db      # SQLite file (created on first run)
├── .env.example
└── backend/.env.example
```

---

## Authentication notes

- After login or OTP verification, a JWT is stored as `sf_token`; `/auth/me` is used on app load to validate it.
- Invalid or expired tokens clear the session; protected API calls that return **401** clear storage and redirect to login (except on public auth pages such as login/signup).

---

## Troubleshooting

- **CORS errors**: Set `FRONTEND_URL` in `backend/.env` to your exact Vite origin (including port).
- **Email / OTP not received**: Check backend logs in dev mode; configure Gmail App Password in `backend/.env`.
- **Database**: `backend/database.db` is created automatically; delete it only if you intend to wipe local data.
