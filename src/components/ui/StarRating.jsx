import { useState } from 'react'
import { Star } from 'lucide-react'

export function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}
        />
      ))}
    </div>
  )
}

export function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform duration-150 hover:scale-125"
        >
          <Star
            size={28}
            className={star <= (hovered || value)
              ? 'text-amber-400 fill-amber-400'
              : 'text-stone-300'}
          />
        </button>
      ))}
    </div>
  )
}
