import { Link } from 'react-router-dom'
import { MapPin, Star, Trophy } from 'lucide-react'
import { calcAvgRating, isNewKitchen } from '../../utils/formatters'

export default function KitchenCard({ kitchen }) {
  const avgRating = calcAvgRating(kitchen.reviews)
  const isNew = isNewKitchen(kitchen.created_at)
  const isTopRated = parseFloat(avgRating) >= 4.3
  const reviewCount = kitchen.reviews?.length || 0

  return (
    <Link to={`/kitchen/${kitchen.id}`} className="block group">
      <div className="glass-card p-0 overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        {/* Cover */}
        <div className="h-44 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-50 relative overflow-hidden flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🏠</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {isNew && (
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">🆕 New</span>
            )}
            {isTopRated && (
              <span className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Trophy size={10} /> Top Rated
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-semibold text-stone-800 text-lg leading-tight">{kitchen.kitchen_name}</h3>
          {kitchen.description && (
            <p className="text-stone-500 text-sm mt-1 line-clamp-2">{kitchen.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-stone-500 text-xs">
              <MapPin size={12} className="text-primary" />
              <span>{kitchen.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-stone-700">{avgRating}</span>
              <span className="text-xs text-stone-400">({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
