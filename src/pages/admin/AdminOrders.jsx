import { useEffect, useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/layout/PageWrapper'
import { StatusBadge } from '../../components/ui/Badge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const STATUS_OPTIONS = ['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, kitchens(kitchen_name), users(name, phone), order_items(*, foods(name))')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesSearch =
      !search ||
      o.kitchens?.kitchen_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.users?.name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_price, 0),
  }

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">All Orders</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: stats.total, icon: '📦' },
          { label: 'Pending', value: stats.pending, icon: '🔔' },
          { label: 'Completed', value: stats.completed, icon: '✅' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), icon: '💰' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xs text-stone-400">{s.label}</p>
              <p className="font-semibold text-stone-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by kitchen or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field py-2 text-sm w-auto"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="glass-card h-20 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-stone-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="glass-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">{order.kitchens?.kitchen_name}</p>
                  <p className="text-sm text-stone-500">Customer: {order.users?.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={order.status} />
                  <p className="font-mono font-semibold text-primary text-sm">{formatCurrency(order.total_price)}</p>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-xs text-stone-400 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    {expanded === order.id ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Details</>}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-3 pt-3 border-t border-stone-100 animate-fade-in">
                  <div className="space-y-1 mb-2">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-stone-600">
                        <span>{item.foods?.name} × {item.quantity}</span>
                        <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-400">📍 {order.delivery_address}</p>
                  {order.users?.phone && <p className="text-xs text-stone-400">📞 {order.users.phone}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
