export default function StatsCard({ icon, label, value, sub, color = 'orange' }) {
  const colors = {
    orange: 'from-orange-50 to-amber-50 border-orange-100',
    blue: 'from-blue-50 to-sky-50 border-blue-100',
    green: 'from-green-50 to-emerald-50 border-green-100',
    red: 'from-red-50 to-rose-50 border-red-100',
    purple: 'from-purple-50 to-violet-50 border-purple-100',
  }

  return (
    <div className={`glass-card bg-gradient-to-br ${colors[color]} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500 font-medium">{label}</p>
          <p className="text-3xl font-display font-bold text-stone-800 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
