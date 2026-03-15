import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useRealtimeOrders } from '../../hooks/useRealtime'
import PageWrapper from '../../components/layout/PageWrapper'
import OrderStatusStepper from '../../components/order/OrderStatusStepper'
import { StatusBadge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ReviewForm from '../../components/review/ReviewForm'
import Button from '../../components/ui/Button'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function Orders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [reviewOrder, setReviewOrder] = useState(null)
  const [reviewedKitchens, setReviewedKitchens] = useState(new Set())

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, kitchens(kitchen_name), order_items(*, foods(name, price))')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    // Fetch which kitchens this user has already reviewed
    const { data: myReviews } = await supabase
      .from('reviews')
      .select('kitchen_id')
      .eq('customer_id', profile.id)
    setReviewedKitchens(new Set((myReviews || []).map(r => r.kitchen_id)))
    setLoading(false)
  }

  useEffect(() => { if (profile) fetchOrders() }, [profile])

  useRealtimeOrders(
    profile ? { key: 'customer_id', value: profile.id } : null,
    (payload) => {
      setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
    }
  )

  if (loading) return (
    <PageWrapper>
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-5 h-24 skeleton" />
        ))}
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-stone-500 text-lg">No orders yet</p>
          <p className="text-stone-400 text-sm mt-1">Place your first order from a home kitchen!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="glass-card p-5 animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">{order.kitchens?.kitchen_name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDateTime(order.created_at)}</p>
                  <p className="text-xs text-stone-500 mt-1">{order.order_items?.length} item(s)</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <StatusBadge status={order.status} />
                  <p className="font-mono font-semibold text-primary">{formatCurrency(order.total_price)}</p>
                  {order.status === 'completed' && !reviewedKitchens.has(order.kitchen_id) && (
                    <Button variant="secondary" className="text-xs py-1 px-3" onClick={() => setReviewOrder(order)}>
                      ⭐ Leave Review
                    </Button>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-xs text-stone-400 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    {expanded === order.id ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-4 pt-4 border-t border-stone-100 animate-fade-in">
                  <div className="overflow-x-auto mb-4">
                    <OrderStatusStepper status={order.status} />
                  </div>
                  <div className="space-y-1.5">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-stone-600">
                        <span>{item.foods?.name} × {item.quantity}</span>
                        <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 mt-3">📍 {order.delivery_address}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={!!reviewOrder} onClose={() => setReviewOrder(null)} title={`Review ${reviewOrder?.kitchens?.kitchen_name}`}>
        <ReviewForm
          kitchenId={reviewOrder?.kitchen_id}
          onSuccess={() => {
            setReviewOrder(null)
            setReviewedKitchens(prev => new Set([...prev, reviewOrder?.kitchen_id]))
          }}
        />
      </Modal>
    </PageWrapper>
  )
}
