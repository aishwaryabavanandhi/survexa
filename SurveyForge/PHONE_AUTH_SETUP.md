# Survexa Phone OTP Authentication

## Overview

Signup requires **full name**, **email**, **mobile number**, and **password**. Users verify **email OTP** then **phone OTP** before the account is active.

Login supports:

- **Email + password** → `POST /auth/login`
- **Mobile + OTP** → `POST /auth/phone/send-otp` (purpose `login`) → `POST /auth/phone/verify-otp`

## Database

`users` table fields:

| Column | Description |
|--------|-------------|
| `phone` | E.164 mobile (unique) |
| `email_verified` | Email OTP completed |
| `phone_verified` | Phone OTP completed |
| `verified` | Account active (both verified) |

`phone_otp` table stores SMS codes (5 min TTL, max 5 attempts, 60s resend cooldown).

Migrations run automatically in `backend/database.js` on startup.

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/signup` | Register + send email & phone OTP |
| POST | `/auth/verify-otp` | Verify email OTP |
| POST | `/auth/resend-otp` | Resend email OTP |
| POST | `/auth/phone/send-otp` | Send phone OTP (`purpose`: `signup` \| `login`) |
| POST | `/auth/phone/verify-otp` | Verify phone OTP |
| POST | `/auth/phone/resend-otp` | Resend phone OTP |
| POST | `/auth/phone/firebase/verify` | Verify Firebase `idToken` after client phone auth |
| GET | `/auth/phone/status` | SMS/Firebase configuration status |

## Environment variables

See `backend/.env.example`. Minimum for local dev:

```env
SMS_PROVIDER=console
DEFAULT_PHONE_REGION=IN
```

OTP codes print in the **backend terminal** when `SMS_PROVIDER=console` or when Twilio/MSG91 fails.

## Firebase Authentication (preferred for production SMS)

1. Create a Firebase project → enable **Phone** sign-in.
2. Add a web app; copy config to frontend (`VITE_FIREBASE_*`).
3. Enable **Phone** provider in Authentication → Sign-in method.
4. Create a **service account** (Project settings → Service accounts → Generate key).
5. Set in `backend/.env`:

```env
SMS_PROVIDER=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Or `FIREBASE_SERVICE_ACCOUNT_JSON` as a single-line JSON string.

**Flow:** Client uses Firebase JS SDK (`signInWithPhoneNumber` + reCAPTCHA) → receives `idToken` → `POST /auth/phone/firebase/verify` with `{ idToken, email, password, name }` for new users.

## Twilio Verify / SMS

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

## MSG91 (India)

```env
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
```

## Frontend routes

| Path | Screen |
|------|--------|
| `/signup` | Full registration form |
| `/otp` | Email OTP verification |
| `/verify-phone` | Phone verification intro (post-email) |
| `/phone/enter` | Enter mobile for login |
| `/phone/otp` | Enter 6-digit phone OTP |
| `/phone/resend` | Resend phone OTP |

## Security

- Rate limiting on `/auth` and `/auth/phone` (20 req / 15 min per IP)
- OTP expiry: 5 minutes
- Max verification attempts: 5
- Resend cooldown: 60 seconds
- JWT via centralized `backend/config/jwt.js`
- International phone validation (`libphonenumber-js`, E.164 storage)

## Run & test

```bash
# Terminal 1
cd SurveyForge/backend && npm run dev

# Terminal 2
cd SurveyForge && npm run dev

# E2E (server must be running)
cd SurveyForge/backend && npm test
```

## Files modified (phone OTP feature)

**Backend**

- `backend/database.js` — schema + migrations
- `backend/routes/auth.js` — dual signup, email OTP attempts
- `backend/routes/phoneAuth.js` — phone OTP routes
- `backend/lib/phoneOtpStore.js`, `backend/lib/emailOtpStore.js`, `backend/lib/userActivation.js`
- `backend/services/smsProvider.js`, `backend/services/firebaseAdmin.js`
- `backend/utils/phone.js`
- `backend/server.js` — mount `/auth/phone`
- `backend/e2e-test.js` — phone auth tests
- `backend/.env.example`

**Frontend**

- `src/pages/auth/Signup.jsx`, `Login.jsx`, `OTP.jsx`
- `src/pages/auth/VerifyPhone.jsx`, `EnterMobile.jsx`, `PhoneOtpVerify.jsx`, `ResendPhoneOtp.jsx`
- `src/components/auth/OtpInputRow.jsx`
- `src/context/AppContext.jsx`, `src/services/api.js`, `src/routes/AppRoutes.jsx`
