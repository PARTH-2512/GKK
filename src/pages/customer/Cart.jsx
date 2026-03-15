import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Confetti from '../../components/ui/Confetti'
import { formatCurrency } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, kitchenId, kitchenName, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const handlePlaceOrder = async () => {
    if (!address.trim()) return toast.error('Please enter delivery address')
    if (items.length === 0) return toast.error('Cart is empty')
    setLoading(true)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: profile.id,
        kitchen_id: kitchenId,
        total_price: totalPrice,
        delivery_address: address,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      food_id: item.food.id,
      quantity: item.quantity,
      price: item.food.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      toast.error(itemsError.message)
      setLoading(false)
      return
    }

    clearCart()
    setConfetti(true)
    toast.success('🎉 Order placed successfully!')
    setTimeout(() => navigate('/orders'), 2000)
  }

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-semibold text-stone-700 mb-2">Your cart is empty</h2>
          <p className="text-stone-400 mb-6">Add some delicious homemade food!</p>
          <Button onClick={() => navigate('/')}>Browse Kitchens</Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Confetti active={confetti} />
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Your Cart</h1>
      <p className="text-stone-500 text-sm mb-6">From: <span className="font-medium text-stone-700">{kitchenName}</span></p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ food, quantity }) => (
            <div key={food.id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {food.image_url ? <img src={food.image_url} alt={food.name} className="w-full h-full object-cover rounded-xl" /> : '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 truncate">{food.name}</p>
                <p className="font-mono text-primary text-sm">{formatCurrency(food.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(food.id, quantity - 1)} className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
                  <Minus size={12} />
                </button>
                <span className="font-mono font-medium w-5 text-center">{quantity}</span>
                <button onClick={() => updateQuantity(food.id, quantity + 1)} className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors">
                  <Plus size={12} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-stone-800">{formatCurrency(food.price * quantity)}</p>
                <button onClick={() => removeFromCart(food.id)} className="text-red-400 hover:text-red-600 mt-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map(({ food, quantity }) => (
                <div key={food.id} className="flex justify-between text-stone-600">
                  <span>{food.name} × {quantity}</span>
                  <span className="font-mono">{formatCurrency(food.price * quantity)}</span>
                </div>
              ))}
              <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between font-semibold text-stone-800">
                <span>Total</span>
                <span className="font-mono text-primary text-lg">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <Input
              label="Delivery Address"
              placeholder="Enter your Ahmedabad address..."
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <Button onClick={handlePlaceOrder} loading={loading} className="w-full mt-4">
              <ShoppingBag size={16} className="mr-2" /> Place Order
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
