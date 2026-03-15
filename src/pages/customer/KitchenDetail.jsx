import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Star, Trophy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/layout/PageWrapper'
import FoodCard from '../../components/food/FoodCard'
import ReviewCard from '../../components/review/ReviewCard'
import ReviewForm from '../../components/review/ReviewForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { FoodCardSkeleton } from '../../components/ui/Skeleton'
import { calcAvgRating, isNewKitchen } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'

export default function KitchenDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [kitchen, setKitchen] = useState(null)
  const [foods, setFoods] = useState([])
  const [reviews, setReviews] = useState([])
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    const [{ data: k }, { data: f }, { data: r }] = await Promise.all([
      supabase.from('kitchens').select('*, reviews(rating)').eq('id', id).single(),
      supabase.from('foods').select('*, categories(name)').eq('kitchen_id', id).eq('is_available', true),
      supabase.from('reviews').select('*, users(name)').eq('kitchen_id', id).order('created_at', { ascending: false }),
    ])
    setKitchen(k)
    setFoods(f || [])
    setReviews(r || [])
    const cats = [...new Set((f || []).map(food => food.categories?.name).filter(Boolean))]
    setCategories(cats)
    if (profile) {
      const existing = (r || []).find(rev => rev.customer_id === profile.id)
      setHasReviewed(!!existing)
    }
    setLoading(false)
  }

  const filteredFoods = activeTab ? foods.filter(f => f.categories?.name === activeTab) : foods
  const avgRating = calcAvgRating(reviews)
  const isTopRated = parseFloat(avgRating) >= 4.3

  if (loading) return (
    <PageWrapper>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)}
      </div>
    </PageWrapper>
  )

  if (!kitchen) return (
    <PageWrapper>
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🏠</div>
        <p className="text-stone-500">Kitchen not found</p>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      {/* Kitchen Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-3xl flex-shrink-0">
            🏠
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-2xl font-bold text-stone-800">{kitchen.kitchen_name}</h1>
              {isTopRated && (
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Trophy size={10} /> Top Rated
                </span>
              )}
              {isNewKitchen(kitchen.created_at) && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">🆕 New</span>
              )}
            </div>
            {kitchen.description && <p className="text-stone-500 text-sm mb-2">{kitchen.description}</p>}
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1"><MapPin size={13} className="text-primary" />{kitchen.address}, {kitchen.city}</span>
              <span className="flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400" />{avgRating} ({reviews.length} reviews)</span>
            </div>
          </div>
          {profile?.role === 'customer' && !hasReviewed && reviews.length > 0 && (
            <Button variant="secondary" onClick={() => setShowReviewModal(true)} className="flex-shrink-0">
              Write Review
            </Button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          <button onClick={() => setActiveTab(null)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!activeTab ? 'bg-primary text-white border-primary' : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary'}`}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveTab(activeTab === cat ? null : cat)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeTab === cat ? 'bg-primary text-white border-primary' : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary'}`}>{cat}</button>
          ))}
        </div>
      )}

      {/* Food Grid */}
      {filteredFoods.length === 0 ? (
        <div className="text-center py-16 glass-card mb-6">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-stone-500">No items available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredFoods.map(food => (
            <FoodCard key={food.id} food={food} kitchenId={kitchen.id} kitchenName={kitchen.kitchen_name} />
          ))}
        </div>
      )}

      {/* Reviews */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-stone-800">Reviews ({reviews.length})</h2>
        {profile?.role === 'customer' && !hasReviewed && (
          <Button variant="secondary" onClick={() => setShowReviewModal(true)}>+ Add Review</Button>
        )}
      </div>
      {reviews.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-stone-500">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a Review">
        <ReviewForm kitchenId={id} onSuccess={() => { setShowReviewModal(false); fetchAll() }} />
      </Modal>
    </PageWrapper>
  )
}
