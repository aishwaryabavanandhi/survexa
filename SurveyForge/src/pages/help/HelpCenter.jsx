import { Link } from 'react-router-dom'

const articles = [
  { q: 'How do I share a survey?', a: 'Publish from the builder, then use Share & publish for a public link, QR, or embed code.', to: '/surveys' },
  { q: 'Where do responses go?', a: 'Responses land in the Responses tab and in Analytics for charts.', to: '/responses' },
  { q: 'How does the AI generator work?', a: 'Describe your study; we draft questions you can edit like any other survey.', to: '/ai-generator' },
  { q: 'Can I brand surveys?', a: 'Use Settings → Branding for logo and accent colors on hosted forms.', to: '/settings/branding' },
]

export default function HelpCenter() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Help center</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quick answers and links into the product.</p>
      </div>

      <div className="grid gap-4">
        {articles.map((x) => (
          <div key={x.q} className="card p-5 border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{x.q}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{x.a}</p>
            <Link to={x.to} className="inline-block mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
              Go there →
            </Link>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 p-6 text-white">
        <p className="text-sm font-medium text-white/90">Still stuck?</p>
        <p className="text-lg font-extrabold mt-1">Contact support</p>
        <p className="text-sm text-white/80 mt-1">support@survexa.io — we typically reply within one business day.</p>
      </div>
    </div>
  )
}
