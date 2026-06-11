/**
 * components/ui/Badge.jsx — Dark mode aware status badge
 */
export default function Badge({ status, size = 'sm' }) {
  const styles = {
    Active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Draft:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    Closed:   'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    Paused:   'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    Premium:  'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
  }

  const dots = {
    Active:   'bg-emerald-500',
    Draft:    'bg-gray-400',
    Closed:   'bg-red-500',
    Paused:   'bg-amber-500',
    Premium:  'bg-violet-500',
  }

  return (
    <span className={`badge ${styles[status] ?? styles.Draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? dots.Draft}`} />
      {status}
    </span>
  )
}
