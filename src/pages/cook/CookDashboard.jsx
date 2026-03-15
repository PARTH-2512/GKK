import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useRealtimeOrders } from '../../hooks/useRealtime'
import PageWrapper from '../../components/layout/PageWrapper'
import StatsCard from '../../components/admin/StatsCard'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import toast from 'react-hot-toast'

const STATUS_FLOW = { pending: ['accepted', 'cancelled'], accepted: ['preparing'], preparing: ['ready'], ready: ['completed'] }

export default function CookDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [kitchen, setKitchen] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) fetchData() }, [profile])

  const fetchData = async () => {
    const { data: k } = await supabase.from('kitchens').select('*').eq('owner_id', profile.id).single()
    if (!k) { setLoading(false); navigate('/cook/kitchen-setup', { replace: true }); return }
    setKitchen(k)
    const { data: o } = await supabase
      .from('orders')
      .select('*, order_items(*, foods(name)), users(name)')
      .eq('kitchen_id', k.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setOrders(o || [])
    setLoading(false)
  }

  useRealtimeOrders(
    kitchen ? { key: 'kitchen_id', value: kitchen.id } : null,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setOrders(prev => [payload.new, ...prev])
        toast('🔔 New order received!')
      } else {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
      }
    }
  )

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId).eq('kitchen_id', kitchen.id)
    if (error) toast.error(error.message)
    else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order ${newStatus}`)
    }
  }

  if (loading) return <PageWrapper><div className="text-center py-20 text-stone-400">Loading dashboard...</div></PageWrapper>

  if (!kitchen) return (
    <PageWrapper>
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🏠</div>
        <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">No Kitchen Yet</h2>
        <p className="text-stone-500 mb-6">Register your kitchen to start receiving orders</p>
        <Button onClick={() => navigate('/cook/kitchen-setup')}>Register Kitchen</Button>
      </div>
    </PageWrapper>
  )

  if (kitchen.status === 'pending') return (
    <PageWrapper>
      <div className="text-center py-20">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Awaiting Approval</h2>
        <p className="text-stone-500">Your kitchen <strong>{kitchen.kitchen_name}</strong> is pending admin approval.</p>
      </div>
    </PageWrapper>
  )

  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_price, 0)

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-800">{kitchen.kitchen_name}</h1>
          <p className="text-stone-500 text-sm mt-0.5">Cook Dashboard</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${kitchen.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
          {kitchen.is_active ? '🟢 Active' : '⏸ Paused'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="📦" label="Orders Today" value={todayOrders.length} color="orange" />
        <StatsCard icon="🔔" label="Pending" value={pendingOrders.length} color="red" sub={pendingOrders.length > 0 ? 'Needs attention' : ''} />
        <StatsCard icon="💰" label="Total Revenue" value={formatCurrency(revenue)} color="green" />
        <StatsCard icon="📋" label="Total Orders" value={orders.length} color="blue" />
      </div>

      <h2 className="font-display text-xl font-semibold text-stone-800 mb-4">Live Orders</h2>
      {orders.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-stone-500">No orders yet. Share your kitchen!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className={`glass-card p-5 ${order.status === 'pending' ? 'border-orange-300 bg-orange-50/50' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-stone-800">{order.users?.name || 'Customer'}</p>
                  <p className="text-xs text-stone-400">{formatDateTime(order.created_at)}</p>
                  <p className="text-xs text-stone-500 mt-1">📍 {order.delivery_address}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="font-mono font-semibold text-primary mt-1">{formatCurrency(order.total_price)}</p>
                </div>
              </div>
              <div className="text-sm text-stone-600 mb-3 space-y-0.5">
                {order.order_items?.map(item => (
                  <div key={item.id}>{item.foods?.name} × {item.quantity}</div>
                ))}
              </div>
              {STATUS_FLOW[order.status] && (
                <div className="flex gap-2 flex-wrap">
                  {STATUS_FLOW[order.status].map(nextStatus => (
                    <Button
                      key={nextStatus}
                      variant={nextStatus === 'cancelled' ? 'danger' : nextStatus === 'accepted' ? 'success' : 'primary'}
                      className="text-xs py-1.5 px-4"
                      onClick={() => updateStatus(order.id, nextStatus)}
                    >
                      {nextStatus === 'accepted' ? '✅ Accept' : nextStatus === 'cancelled' ? '❌ Reject' : `→ ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
