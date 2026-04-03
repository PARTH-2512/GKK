import { useState } from 'react'
import { Plus, Flame } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function FoodCard({ food, kitchenId, kitchenName, isPopular }) {
  const { addToCart, kitchenId: cartKitchenId, kitchenName: cartKitchenName } = useCart()
  const [showWarning, setShowWarning] = useState(false)
  const [imageStatus, setImageStatus] = useState('idle') // idle | loading | loaded | error

  const handleAdd = () => {
    if (cartKitchenId && cartKitchenId !== kitchenId) {
      setShowWarning(true)
      return
    }
    addToCart(food, kitchenId, kitchenName)
    toast.success('Added to cart')
  }

  const handleReplace = () => {
    addToCart(food, kitchenId, kitchenName)
    setShowWarning(false)
    toast.success('Cart updated')
  }

  return (
    <>
      <div className="glass-card p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
        <div className="relative h-40 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
          {food.image_url && imageStatus !== 'error' ? (
            <img
              src={food.image_url}
              alt={food.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onLoad={() => setImageStatus('loaded')}
              onError={(e) => {
                console.error('[FoodCard] image load failed', food.image_url, e)
                setImageStatus('error')
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
          )}
          {isPopular && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame size={10} /> Popular
            </span>
          )}
          {food.categories?.name && (
            <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-stone-600 text-xs px-2 py-0.5 rounded-full">
              {food.categories.name}
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-stone-800 text-sm leading-tight">{food.name}</h3>
          {food.description && (
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{food.description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono font-semibold text-primary text-sm">{formatCurrency(food.price)}</span>
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <Plus size={14} />
            </button>
          </div>
          {food.quantity_available > 0 && food.quantity_available <= 5 && (
            <p className="text-xs text-amber-600 mt-1">Only {food.quantity_available} left!</p>
          )}
        </div>
      </div>

      <Modal isOpen={showWarning} onClose={() => setShowWarning(false)} title="Replace Cart?" size="sm">
        <p className="text-stone-600 text-sm mb-4">
          Your cart has items from <strong>{cartKitchenName || 'another kitchen'}</strong>. Adding this item will clear your current cart.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setShowWarning(false)}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={handleReplace}>Replace Cart</Button>
        </div>
      </Modal>
    </>
  )
}
