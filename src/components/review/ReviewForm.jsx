import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { StarPicker } from '../ui/StarRating'
import Button from '../ui/Button'
import { Textarea } from '../ui/Input'
import toast from 'react-hot-toast'

export default function ReviewForm({ kitchenId, onSuccess }) {
  const { profile } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return toast.error('Please select a rating')
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      customer_id: profile.id,
      kitchen_id: kitchenId,
      rating,
      comment,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('⭐ Review submitted!')
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Your Rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <Textarea
        label="Comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
      />
      <Button type="submit" loading={loading} className="w-full">Submit Review</Button>
    </form>
  )
}
