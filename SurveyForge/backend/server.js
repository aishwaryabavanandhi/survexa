/**
 * server.js — Survexa backend with Helmet, rate limiting, and CORS
 */

require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')
const path       = require('path')

const { initDatabase } = require('./database/database')

/* ── Rate limiters ───────────────────────────────────────── */
const authLimiter = rateLimit({
  windowMs:  15 * 60 * 1000, // 15 min
  max:       20,              // 20 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests. Please try again in 15 minutes.' },
  skip: (req) => process.env.NODE_ENV === 'development',
})

const apiLimiter = rateLimit({
  windowMs:  1 * 60 * 1000,  // 1 min
  max:       120,             // 120 requests per min per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
  skip: (req) => process.env.NODE_ENV === 'development',
})

async function startServer() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production')
  }

  // Must init DB before mounting routes (sql.js is async)
  await initDatabase()

  /* Route modules (imported AFTER DB ready) */
  const authRoutes          = require('./routes/auth')
  const phoneAuthRoutes     = require('./routes/phoneAuth')
  const aiRoutes            = require('./routes/ai')
  const surveysRoutes       = require('./routes/surveys')
  const questionsRoutes     = require('./routes/questions')
  const responsesRoutes     = require('./routes/responses')
  const reportsRoutes       = require('./routes/reports')
  const publicRoutes        = require('./routes/public')
  const insightsRoutes      = require('./routes/insights')
  const adminRoutes         = require('./routes/admin')
  const notificationsRoutes = require('./routes/notifications')
  const campaignsRoutes     = require('./routes/campaigns')
  const billingRoutes       = require('./routes/billing')
  const { billingWebhookHandler } = require('./routes/billing')
  const manualPaymentsRoutes = require('./routes/manualPayments')
  const activityRoutes       = require('./routes/activity')

  const { requireAuth, requireAdmin } = require('./middleware/auth')

  const app  = express()
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
  const PORT = process.env.PORT ?? 5000

  /* ── Security middleware ─────────────────────────────── */
  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }))

  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    // Capacitor Android app (both schemes used depending on Android version)
    'capacitor://localhost',
    'http://localhost',
    'ionic://localhost',
    'https://localhost',
    // Allow any Vercel preview/production deployment
    ...(process.env.EXTRA_CORS_ORIGINS
      ? process.env.EXTRA_CORS_ORIGINS.split(',').map(s => s.trim())
      : []),
  ]

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      // Allow any *.vercel.app and *.onrender.com domain dynamically
      if (/\.vercel\.app$/.test(origin) || /\.onrender\.com$/.test(origin)) {
        return callback(null, true)
      }
      return callback(null, true) // permissive in dev; tighten if needed
    },
    credentials: true,
  }))

  app.post(
    '/billing/webhook',
    express.raw({ type: 'application/json' }),
    billingWebhookHandler,
  )
  app.post(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
    billingWebhookHandler,
  )

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(apiLimiter)

  /* Request logger */
  app.use((req, _res, next) => {
    process.stdout.write(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`)
    next()
  })

  /* ── Public routes ───────────────────────────────────── */
  app.use('/auth',       authLimiter, authRoutes)
  app.use('/auth/phone', authLimiter, phoneAuthRoutes)
  app.get('/billing/plans', (_req, res) => {
    const { listPlans } = require('./lib/plans')
    const { isRazorpayConfigured } = require('./services/razorpay')
    res.json({
      success: true,
      plans: listPlans(true),
      razorpay: isRazorpayConfigured(),
      keyId: process.env.RAZORPAY_KEY_ID?.includes('your-') ? null : process.env.RAZORPAY_KEY_ID,
    })
  })
  app.get('/api/billing/plans', (_req, res) => {
    const { listPlans } = require('./lib/plans')
    const { isRazorpayConfigured } = require('./services/razorpay')
    res.json({
      success: true,
      plans: listPlans(true),
      razorpay: isRazorpayConfigured(),
      keyId: process.env.RAZORPAY_KEY_ID?.includes('your-') ? null : process.env.RAZORPAY_KEY_ID,
    })
  })
  app.use('/', manualPaymentsRoutes)
  app.use('/api', manualPaymentsRoutes)
  app.use('/billing', requireAuth, billingRoutes)
  app.use('/api/billing', requireAuth, billingRoutes)
  app.use('/public', publicRoutes)

  /* ── Protected routes ────────────────────────────────────── */
  app.use('/generate-questions', requireAuth, aiRoutes)
  app.use('/ai',                 requireAuth, aiRoutes)
  app.use('/surveys',            requireAuth, surveysRoutes)
  app.use('/questions',          requireAuth, questionsRoutes)
  app.use('/responses',          requireAuth, responsesRoutes)
  app.use('/reports',            requireAuth, reportsRoutes)
  app.use('/insights',           requireAuth, insightsRoutes)
  app.use('/notifications',      requireAuth, notificationsRoutes)
  app.use('/campaigns',          requireAuth, campaignsRoutes)
  app.use('/activity',           requireAuth, activityRoutes)

  /* ── Admin routes (auth + admin role required) ───────── */
  app.use('/admin', requireAuth, requireAdmin, adminRoutes)

  /* Health check — exposes real config status for the dashboard */
  app.get('/health', (_req, res) => {
    const openaiKey = process.env.OPENAI_API_KEY || ''
    const emailUser = process.env.EMAIL_USER     || ''
    const { getSmsProviderStatus } = require('./services/smsProvider')
    const { isFirebaseConfigured } = require('./services/firebaseAdmin')
    res.json({
      status:  'ok',
      service: 'Survexa API',
      version: '2.1.0',
      time:    new Date().toISOString(),
      uptime:  Math.floor(process.uptime()) + 's',
      config: {
        openai: openaiKey.length > 0 && !openaiKey.startsWith('sk-your'),
        email:  emailUser.length > 0 && !emailUser.includes('your-email'),
        jwt:    !!process.env.JWT_SECRET,
        sms:    getSmsProviderStatus(),
        firebase: isFirebaseConfigured(),
      },
    })
  })

  /* 404 */
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' })
  })

  /* Global error handler */
  app.use((err, _req, res, _next) => {
    console.error('[Server Error]', err)
    res.status(err.status ?? 500).json({ success: false, error: err.message ?? 'Internal server error' })
  })

  app.listen(PORT, () => {
    console.log('')
    console.log('  🚀  Survexa API v2.0.0')
    console.log(`  ➜   http://localhost:${PORT}`)
    console.log(`  ➜   Health: http://localhost:${PORT}/health`)
    console.log('')
    console.log('  Security:  ✅ Helmet + Rate Limiting active')
    console.log('  OpenAI:   ', process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-your') ? '✅ configured' : '⚠  NOT set')
    console.log('  Email:    ', process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your-email') ? '✅ configured' : '⚠  NOT set — OTP logged to console')
    console.log('  JWT:      ', process.env.JWT_SECRET ? '✅ configured' : '⚠  Using default secret')
    console.log('')
  })
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
