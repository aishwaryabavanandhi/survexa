import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { getAdminBilling } from '../../services/api'
import Button from '../../components/ui/Button'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

/* ── Helper Functions ────────────────────────────────────────── */
function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtDateShort(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AdminBilling() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  
  // Charts config
  const [revenueTimeframe, setRevenueTimeframe] = useState('daily') // 'daily' or 'monthly'
  
  // Table state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch billing data
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getAdminBilling()
      if (res.success) {
        setData(res.data)
      } else {
        toast.error(res.error || 'Failed to fetch billing metrics')
      }
    } catch (err) {
      console.error('[AdminBilling] Fetch error:', err)
      toast.error('Could not connect to the backend billing service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filtered payments
  const filteredPayments = useMemo(() => {
    if (!data?.recent_payments) return []
    const term = searchTerm.toLowerCase().trim()
    if (!term) return data.recent_payments

    return data.recent_payments.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(term)
      const emailMatch = p.email?.toLowerCase().includes(term)
      const statusMatch = p.status?.toLowerCase().includes(term)
      const receiptMatch = p.receipt_id?.toLowerCase().includes(term)
      const orderMatch = p.provider_order_id?.toLowerCase().includes(term)
      const payMatch = p.provider_payment_id?.toLowerCase().includes(term)
      return nameMatch || emailMatch || statusMatch || receiptMatch || orderMatch || payMatch
    })
  }, [data?.recent_payments, searchTerm])

  // Paginated payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPayments, currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage))

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Export CSV functionality
  const handleExportCSV = () => {
    if (!data?.recent_payments || data.recent_payments.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = [
      'Transaction ID',
      'Customer Name',
      'Customer Email',
      'Amount (INR)',
      'Status',
      'Order ID',
      'Payment ID',
      'Receipt ID',
      'Date',
    ]

    const rows = data.recent_payments.map(p => [
      p.id,
      p.name || 'N/A',
      p.email || 'N/A',
      Math.round(p.amount_paise / 100),
      p.status,
      p.provider_order_id || 'N/A',
      p.provider_payment_id || 'N/A',
      p.receipt_id || 'N/A',
      p.created_at,
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `survexa_billing_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Billing report exported successfully')
    } catch (err) {
      console.error('[AdminBilling] Export failed:', err)
      toast.error('Failed to export CSV report')
    }
  }

  // Chart: Revenue (Daily / Monthly)
  const revenueChartData = useMemo(() => {
    if (!data) return null

    if (revenueTimeframe === 'daily') {
      const dailyData = data.chart_daily_revenue || []
      return {
        labels: dailyData.map(d => fmtDateShort(d.day)),
        datasets: [
          {
            label: 'Revenue (INR)',
            data: dailyData.map(d => d.amount_inr),
            borderColor: '#8b5cf6', // Violet
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#8b5cf6',
            pointHoverRadius: 6,
          },
        ],
      }
    } else {
      const monthlyData = data.chart_monthly_revenue || []
      return {
        labels: monthlyData.map(m => {
          if (!m.month) return '—'
          const [year, month] = m.month.split('-')
          const date = new Date(Number(year), Number(month) - 1)
          return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        }),
        datasets: [
          {
            label: 'Revenue (INR)',
            data: monthlyData.map(m => m.amount_inr),
            borderColor: '#06b6d4', // Cyan
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointBackgroundColor: '#06b6d4',
            pointHoverRadius: 6,
          },
        ],
      }
    }
  }, [data, revenueTimeframe])

  // Chart: Subscription Growth
  const growthChartData = useMemo(() => {
    if (!data?.subscription_growth) return null
    const growth = data.subscription_growth

    return {
      labels: growth.map(g => {
        if (!g.month) return '—'
        const [year, month] = g.month.split('-')
        const date = new Date(Number(year), Number(month) - 1)
        return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
      }),
      datasets: [
        {
          label: 'New Subscriptions',
          data: growth.map(g => g.count),
          backgroundColor: 'rgba(214, 198, 255, 0.75)', // Lavender pastel
          borderColor: '#8b5cf6',
          borderWidth: 0,
          borderRadius: 8,
          maxBarThickness: 32,
        },
      ],
    }
  }, [data])

  // Chart: Plan Distribution
  const planDistributionData = useMemo(() => {
    if (!data?.subscriptions_by_plan) return null
    const plans = data.subscriptions_by_plan

    const colorPalette = {
      starter: '#d6c6ff',     // Lavender
      premium: '#f5c3e8',     // Pink
      enterprise: '#b8f2f5',  // Cyan
      free: '#ffd7b8',        // Peach
    }

    return {
      labels: plans.map(p => p.plan_id.charAt(0).toUpperCase() + p.plan_id.slice(1)),
      datasets: [
        {
          data: plans.map(p => p.count),
          backgroundColor: plans.map(p => colorPalette[p.plan_id.toLowerCase()] || '#c8d4ff'),
          borderWidth: 2,
          borderColor: 'var(--sf-bg-elevated)',
          hoverOffset: 6,
        },
      ],
    }
  }, [data])

  // Chart Options
  const mainChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161622',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` Revenue: ${fmtCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--sf-text-muted)', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: {
          color: 'var(--sf-text-muted)',
          font: { family: 'Inter', size: 11 },
          callback: (value) => '₹' + value,
        },
      },
    },
  }

  const growthChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161622',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--sf-text-muted)', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: {
          color: 'var(--sf-text-muted)',
          font: { family: 'Inter', size: 11 },
          precision: 0,
        },
      },
    },
  }

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--sf-text)',
          font: { family: 'Inter', size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#161622',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` Active: ${context.parsed} subscribers`,
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading billing analytics...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/20">
            📊
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Billing Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Financial health, subscription growth, and payments tracking
            </p>
          </div>
        </div>
        <Button data-testid="Button-elt-19" variant="secondary" onClick={handleExportCSV} className="self-start sm:self-center shadow-sm">
          <span>📤</span> Export CSV Report
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <span className="text-xl">💰</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3 font-display">
              {fmtCurrency(data?.total_revenue_inr)}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            Total lifetime captured payments: <span className="font-semibold text-gray-700 dark:text-gray-300">{data?.payment_count}</span>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
              <span className="text-xl">📅</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3 font-display">
              {fmtCurrency(data?.monthly_revenue_inr)}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span> Captured over past 30 days
          </div>
        </motion.div>

        {/* Daily Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Daily Revenue</span>
              <span className="text-xl">⚡</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3 font-display">
              {fmtCurrency(data?.daily_revenue_inr)}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="text-indigo-500">⚡</span> Captured over past 24 hours
          </div>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Payment Success Rate</span>
              <span className="text-xl">🎯</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
                {data?.success_rate}%
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">rate</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-red-500 dark:text-red-400 flex justify-between items-center">
            <span>Failed payments:</span>
            <span className="font-bold bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">{data?.failed_payments ?? 0}</span>
          </div>
        </motion.div>
      </div>

      {/* Users Ratio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown Progress Bar */}
        <div className="card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider">User Distribution</h3>
            <p className="text-xs text-gray-400 mt-1">Paid subscribers vs Free Tier users</p>
            
            <div className="space-y-6 mt-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-violet-600 dark:text-violet-400">Paid Subscribers</span>
                  <span>{data?.paid_users} / {data?.active_users}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full"
                    style={{ width: `${data?.active_users > 0 ? (data.paid_users / data.active_users) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-amber-600 dark:text-amber-400">Free Users</span>
                  <span>{data?.free_users} / {data?.active_users}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    style={{ width: `${data?.active_users > 0 ? (data.free_users / data.active_users) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-400">Total Active</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{data?.active_users}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Paid %</p>
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400 mt-1">
                {data?.active_users > 0 ? Math.round((data.paid_users / data.active_users) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Free %</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                {data?.active_users > 0 ? Math.round((data.free_users / data.active_users) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Plan Distribution Chart */}
        <div className="card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider">Plan Distribution</h3>
            <p className="text-xs text-gray-400 mt-1">Active subscriptions breakdown by tier type</p>
          </div>
          <div className="h-48 relative flex items-center justify-center mt-4">
            {planDistributionData ? (
              <Doughnut data={planDistributionData} options={doughnutOpts} />
            ) : (
              <p className="text-sm text-gray-400">No subscription plan distribution details</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics Line Chart */}
        <div className="card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider">Revenue Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Timeline chart of captured revenue payments</p>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 text-xs">
              <button data-testid="button-elt-20"
                onClick={() => setRevenueTimeframe('daily')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  revenueTimeframe === 'daily'
                    ? 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Daily (30d)
              </button>
              <button data-testid="button-elt-21"
                onClick={() => setRevenueTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  revenueTimeframe === 'monthly'
                    ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Monthly (12m)
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 relative chart-scroll-pass">
            {revenueChartData ? (
              <Line data={revenueChartData} options={mainChartOpts} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No revenue data available</div>
            )}
          </div>
        </div>

        {/* Subscription Growth Bar Chart */}
        <div className="card p-6 flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider">Subscription Growth</h3>
            <p className="text-xs text-gray-400 mt-0.5">Monthly acquisitions of paid subscriptions (last 6 months)</p>
          </div>
          <div className="flex-1 min-h-0 relative chart-scroll-pass">
            {growthChartData ? (
              <Bar data={growthChartData} options={growthChartOpts} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No subscription growth data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider">Recent Transactions</h3>
            <p className="text-xs text-gray-400 mt-1">Listing payments processed for subscriptions (last 50)</p>
          </div>
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input data-testid="input-elt-22"
              type="text"
              placeholder="Search user, status, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pr-10 py-2.5 text-xs shadow-sm bg-gray-50/50 dark:bg-gray-800/50"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 font-bold">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Provider Identifiers</th>
                <th className="px-6 py-3.5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {paginatedPayments.map((p) => {
                let badgeClass = 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400'
                if (p.status === 'captured') {
                  badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                } else if (p.status === 'failed') {
                  badgeClass = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                } else if (p.status === 'created') {
                  badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                }

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                          {p.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{p.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">{p.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {fmtCurrency(p.amount_paise / 100)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${badgeClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400 space-y-0.5">
                      <div><span className="text-[10px] text-gray-400">Order:</span> {p.provider_order_id || 'N/A'}</div>
                      <div><span className="text-[10px] text-gray-400">Payment:</span> {p.provider_payment_id || 'N/A'}</div>
                      <div><span className="text-[10px] text-gray-400">Receipt:</span> {p.receipt_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {fmtDate(p.created_at)}
                    </td>
                  </tr>
                )
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {filteredPayments.length > itemsPerPage && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {Math.min(currentPage * itemsPerPage, filteredPayments.length)}
              </span>{' '}
              of <span className="font-semibold text-gray-800 dark:text-white">{filteredPayments.length}</span> transactions
            </span>
            <div className="flex items-center gap-2">
              <Button data-testid="Button-elt-23"
                variant="secondary"
                size="xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="px-3 text-gray-600 dark:text-gray-300 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button data-testid="Button-elt-24"
                variant="secondary"
                size="xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
