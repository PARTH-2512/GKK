import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import { StatusBadge } from '../../components/ui/Badge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const STATUSES = ['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']

export default function ManageOrders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: k } = await supabase.from('kitchens').select('id').eq('owner_id', profile.id).single()
      if (!k) { setLoading(false); return }
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, foods(name)), users(name)')
        .eq('kitchen_id', k.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    if (profile) fetchOrders()
  }, [profile])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Order History</h1>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center"><div className="text-4xl mb-2">📭</div><p className="text-stone-500">No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="glass-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">{order.users?.name}</p>
                  <p className="text-xs text-stone-400">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-mono font-semibold text-primary">{formatCurrency(order.total_price)}</span>
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-xs text-stone-400 hover:text-primary">
                    {expanded === order.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>
              {expanded === order.id && (
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 animate-fade-in">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-stone-600">
                      <span>{item.foods?.name} × {item.quantity}</span>
                      <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <p className="text-xs text-stone-400 mt-2">📍 {order.delivery_address}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
