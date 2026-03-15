import { StarDisplay } from '../ui/StarRating'
import { formatDate } from '../../utils/formatters'

export default function ReviewCard({ review }) {
  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center text-sm font-semibold text-orange-700">
            {review.users?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-stone-800 text-sm">{review.users?.name || 'Anonymous'}</p>
            <p className="text-xs text-stone-400">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <StarDisplay rating={review.rating} size={14} />
      </div>
      {review.comment && (
        <p className="text-stone-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}
