export default function StatCard({ icon, label, value, change, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-500',
    green:   'bg-green-50 text-green-500',
    amber:   'bg-amber-50 text-amber-500',
    rose:    'bg-rose-50 text-rose-500',
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full
            ${change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}
