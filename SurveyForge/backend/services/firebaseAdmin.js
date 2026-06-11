/**
 * Firebase Admin — verify phone-auth ID tokens from the client SDK
 */
let _app = null

function initFirebaseAdmin() {
  if (_app) return _app

  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) return null

  try {
    const admin = require('firebase-admin')

    if (admin.apps?.length) {
      _app = admin.app()
      return _app
    }

    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      _app = admin.initializeApp({ credential: admin.credential.cert(cred) })
    } else if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      _app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      })
    } else {
      _app = admin.initializeApp({ projectId })
    }

    console.log('  Firebase Admin: ✅ initialized')
    return _app
  } catch (err) {
    console.warn('  Firebase Admin: ⚠️', err.message)
    return null
  }
}

/**
 * Verify Firebase ID token (after client-side phone OTP)
 * @returns {{ uid: string, phone?: string }}
 */
async function verifyFirebaseIdToken(idToken) {
  const app = initFirebaseAdmin()
  if (!app) {
    throw new Error('Firebase is not configured on the server')
  }
  const admin = require('firebase-admin')
  const decoded = await admin.auth().verifyIdToken(idToken)
  return {
    uid: decoded.uid,
    phone: decoded.phone_number || null,
  }
}

function isFirebaseConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID)
}

module.exports = { initFirebaseAdmin, verifyFirebaseIdToken, isFirebaseConfigured }
