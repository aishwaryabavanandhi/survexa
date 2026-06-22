import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getBillingUsage,
  getBillingPayments,
  cancelBillingSubscription,
  renewBillingSubscription,
  verifyBillingPayment,
  getActivePaymentRequest,
} from '../../services/api'
import Button from '../../components/ui/Button'
import { useSubscription } from '../../hooks/useSubscription'
import { useApp } from '../../context/AppContext'
import { openRazorpayCheckout } from '../../utils/razorpayCheckout'

function UsageBar({ label, used, limit }) {
  const unlimited = limit === null || limit === undefined
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-[var(--sf-text)]">{label}</span>
        <span className="text-[var(--sf-text-muted)]">
          {used}{unlimited ? '' : ` / ${limit}`}
          {unlimited && ' (unlimited)'}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 bg-[var(--sf-border)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[var(--sf-primary)]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function Billing() {
  const { user } = useApp()
  const { data, refresh } = useSubscription()
  const [payments, setPayments] = useState([])
  const [cancelling, setCancelling] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [pendingRequest, setPendingRequest] = useState(null)

  const loadPayments = () => {
    getBillingPayments()
      .then((res) => setPayments(res.data ?? []))
      .catch(() => setPayments([]))
    getActivePaymentRequest()
      .then((res) => {
        if (res.success && res.data) {
          setPendingRequest(res.data)
        } else {
          setPendingRequest(null)
        }
      })
      .catch(() => setPendingRequest(null))
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const handleCancel = async (immediate = false) => {
    setCancelling(true)
    try {
      const res = await cancelBillingSubscription(immediate)
      if (res.success) {
        toast.success(res.message)
        await refresh()
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not cancel')
    } finally {
      setCancelling(false)
    }
  }

  const handleRenew = async () => {
    setRenewing(true)
    try {
      const orderRes = await renewBillingSubscription()
      if (!orderRes.success) throw new Error(orderRes.error || 'Renewal failed')

      if (orderRes.devMode && !orderRes.keyId) {
        const verify = await verifyBillingPayment({
          planId: orderRes.plan.id,
          razorpay_order_id: orderRes.order.id,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: 'dev',
        })
        if (verify.success) {
          toast.success(verify.message || 'Subscription renewed (dev mode)')
          await refresh()
          loadPayments()
        }
        return
      }

      if (!orderRes.keyId) {
        toast.error('Razorpay is not configured')
        return
      }

      await openRazorpayCheckout({
        keyId: orderRes.keyId,
        orderId: orderRes.order.id,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        description: `Renew Survexa ${orderRes.plan?.name}`,
        prefill: { email: user?.email, name: user?.name },
        onSuccess: async (response) => {
          const verify = await verifyBillingPayment({
            planId: orderRes.plan.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          if (verify.success) {
            toast.success(verify.message || 'Subscription renewed!')
            await refresh()
            loadPayments()
          } else {
            toast.error(verify.error || 'Verification failed')
          }
        },
      })
    } catch (err) {
      if (err.message !== 'Payment cancelled') toast.error(err.message || 'Renewal failed')
    } finally {
      setRenewing(false)
    }
  }

  if (!data) {
    return <div className="p-8 text-[var(--sf-text-muted)]">Loading billing…</div>
  }

  const { plan, subscription, usage, limits } = data
  const isPaid = plan.id !== 'free'
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null
  const isExpiringSoon =
    periodEnd && periodEnd.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sf-text)] font-display">Billing</h1>
          <p className="text-sm text-[var(--sf-text-muted)] mt-1">Manage your subscription and usage</p>
        </div>
        {!pendingRequest && (
          <Link to="/upgrade">
            <Button data-testid="Button-elt-88">{isPaid ? 'Change plan' : 'Upgrade plan'}</Button>
          </Link>
        )}
      </div>

      {pendingRequest && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
          <div className="text-2xl shrink-0">⏳</div>
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Payment Verification in Progress</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Your request to upgrade to the <span className="font-semibold">{pendingRequest.plan_name}</span> plan for ₹{pendingRequest.amount} is currently pending admin approval.
            </p>
            <div className="mt-2 text-[10px] font-mono text-amber-600 dark:text-amber-500">
              Ref ID: {pendingRequest.payment_reference} · Submitted: {new Date(pendingRequest.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--sf-text-muted)]">Current plan</p>
            <h2 className="text-2xl font-bold text-[var(--sf-text)]">{plan.name}</h2>
            <p className="text-sm text-[var(--sf-text-muted)] mt-1">
              {plan.price_inr === 0 ? 'Free forever' : `₹${plan.price_inr}/month`}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            {subscription.status}
          </span>
        </div>
        {periodEnd && (
          <p className="text-xs text-[var(--sf-text-muted)]">
            Renews / ends: {periodEnd.toLocaleDateString()}
            {subscription.cancel_at_period_end && ' (cancels at period end)'}
            {isExpiringSoon && !subscription.cancel_at_period_end && (
              <span className="text-amber-600 font-semibold ml-2">· Expiring soon</span>
            )}
          </p>
        )}
        {isPaid && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button data-testid="Button-elt-89" size="sm" loading={renewing} onClick={handleRenew} disabled={!!pendingRequest}>
              Renew subscription
            </Button>
            <Button data-testid="Button-elt-90" variant="secondary" size="sm" loading={cancelling} onClick={() => handleCancel(false)} disabled={!!pendingRequest}>
              Cancel at period end
            </Button>
            <Button data-testid="Button-elt-91" variant="ghost" size="sm" loading={cancelling} onClick={() => handleCancel(true)} disabled={!!pendingRequest}>
              Downgrade to Free now
            </Button>
          </div>
        )}
      </div>

      <div className="card p-6 space-y-5">
        <h3 className="font-bold text-[var(--sf-text)]">Usage this period</h3>
        <UsageBar label="Surveys created" used={usage.surveys_created} limit={limits.surveys} />
        <UsageBar label="Responses collected" used={usage.responses_collected} limit={limits.responses} />
        <UsageBar label="AI requests used" used={usage.ai_requests_used} limit={limits.ai} />
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-[var(--sf-text)] mb-4">Payment history</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-[var(--sf-text-muted)]">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--sf-text-muted)] border-b border-[var(--sf-border)]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--sf-border)] last:border-0">
                    <td className="py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 capitalize">{p.plan_id}</td>
                    <td className="py-3">₹{(p.amount_paise / 100).toFixed(0)}</td>
                    <td className="py-3 capitalize">{p.method || 'Razorpay'}</td>
                    <td className="py-3 capitalize">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--sf-text-muted)] text-center">
        Payments processed by Razorpay · UPI · Credit & Debit Cards · Net Banking
      </p>
    </div>
  )
}
