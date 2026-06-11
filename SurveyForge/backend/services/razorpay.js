/**
 * Razorpay payment gateway
 */
const crypto = require('crypto')

let _instance = null

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (
    !keyId ||
    !keySecret ||
    keyId.includes('your-') ||
    keyId.includes('xxxx') ||
    keyId.includes('change-me') ||
    keyId.trim() === '' ||
    keySecret.trim() === ''
  ) return null
  if (!_instance) {
    const Razorpay = require('razorpay')
    _instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }
  return _instance
}

function isRazorpayConfigured() {
  return Boolean(getRazorpay())
}

async function createOrder({ amountPaise, receipt, notes = {} }) {
  const rz = getRazorpay()
  if (!rz) {
    return {
      devMode: true,
      id: `order_dev_${Date.now()}`,
      amount: amountPaise,
      currency: 'INR',
      receipt,
    }
  }
  const order = await rz.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: String(receipt).slice(0, 40),
    notes,
  })
  return { devMode: false, ...order }
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret || secret.includes('your-')) {
    if (process.env.NODE_ENV === 'development' && paymentId?.startsWith('pay_dev_')) {
      return true
    }
    return false
  }
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return expected === signature
}

module.exports = {
  getRazorpay,
  isRazorpayConfigured,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
}
