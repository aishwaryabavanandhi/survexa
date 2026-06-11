/**
 * components/ui/Skeleton.jsx — Shimmer skeleton loading states
 * Usage: <Skeleton className="h-6 w-32" /> or <SkeletonCard />
 */

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Card skeleton for survey list */
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  )
}

/** Row skeleton for table views */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={`h-4 ${i === 0 ? 'w-3/4' : 'w-16'}`} />
        </td>
      ))}
    </tr>
  )
}

/** Stat card skeleton */
export function SkeletonStat() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

/** Full page skeleton for dashboard */
export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3 mt-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <Skeleton className="h-5 w-28" />
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array(count).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
