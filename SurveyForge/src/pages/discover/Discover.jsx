import { Link } from 'react-router-dom'

const highlights = [
  { title: 'Live theme sync', body: 'Branding tab now previews accent colors on sample cards.', tag: 'New' },
  { title: 'Share hub', body: 'Dedicated publish screen with embed snippet and QR.', tag: 'New' },
  { title: 'Mobile nav polish', body: 'Bottom bar clears toasts and respects safe areas.', tag: 'Improved' },
]

export default function Discover() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">What&apos;s new</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Product updates and roadmap teasers.</p>
      </div>

      <ul className="space-y-4">
        {highlights.map((h) => (
          <li key={h.title} className="card p-5 flex flex-wrap items-start justify-between gap-3 border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">{h.tag}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mt-1">{h.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{h.body}</p>
            </div>
            <Link to="/templates" className="text-xs font-bold text-primary-600 dark:text-primary-400 self-center hover:underline shrink-0">
              Explore →
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-[#2a2a3a] p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Roadmap cards (SSO, logic branching, white-label) will appear here as they ship.
      </div>
    </div>
  )
}
