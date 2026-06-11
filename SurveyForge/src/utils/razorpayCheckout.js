/**
 * Load Razorpay checkout script and open payment modal
 */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  name = 'Survexa',
  description,
  prefill = {},
  onSuccess,
  onDismiss,
}) {
  const Razorpay = await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill,
      theme: { color: '#9474C8' },
      handler(response) {
        onSuccess?.(response)
        resolve(response)
      },
      modal: {
        ondismiss() {
          onDismiss?.()
          reject(new Error('Payment cancelled'))
        },
      },
    }

    const rzp = new Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || 'Payment failed'))
    })
    rzp.open()
  })
}
