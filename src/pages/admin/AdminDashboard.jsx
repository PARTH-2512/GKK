import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/layout/PageWrapper'
import StatsCard from '../../components/admin/StatsCard'
import Button from '../../components/ui/Button'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [
        { count: users },
        { count: kitchens },
        { count: pending },
        { count: todayOrders },
        { data: completedOrders },
        { data: recentLogs },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('kitchens').select('*', { count: 'exact', head: true }),
        supabase.from('kitchens').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('orders').select('total_price').eq('status', 'completed'),
        supabase.from('admin_logs').select('*, users(name)').order('created_at', { ascending: false }).limit(5),
      ])
      const revenue = (completedOrders || []).reduce((s, o) => s + o.total_price, 0)
      setStats({ users, kitchens, pending, todayOrders, revenue })
      setLogs(recentLogs || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Admin Dashboard</h1>
      {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard icon="👥" label="Total Users" value={stats.users} color="blue" />
            <StatsCard icon="🏠" label="Kitchens" value={stats.kitchens} sub={stats.pending > 0 ? `${stats.pending} pending` : ''} color="orange" />
            <StatsCard icon="📦" label="Orders Today" value={stats.todayOrders} color="purple" />
            <StatsCard icon="💰" label="Total Revenue" value={formatCurrency(stats.revenue)} color="green" />
          </div>

          {stats.pending > 0 && (
            <div className="glass-card p-4 mb-6 border-orange-200 bg-orange-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-semibold text-stone-800">{stats.pending} Kitchen{stats.pending > 1 ? 's' : ''} Awaiting Approval</p>
                  <p className="text-sm text-stone-500">Review and approve pending kitchens</p>
                </div>
              </div>
              <Button onClick={() => navigate('/admin/kitchens')}>Review Now</Button>
            </div>
          )}

          <h2 className="font-display text-xl font-semibold text-stone-800 mb-4">Recent Activity</h2>
          {logs.length === 0 ? (
            <div className="glass-card p-8 text-center text-stone-400">No admin activity yet</div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50/80">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Time</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Admin</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Action</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-t border-stone-100 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-400 text-xs">{formatDateTime(log.created_at)}</td>
                      <td className="px-4 py-3 text-stone-700">{log.users?.name}</td>
                      <td className="px-4 py-3 text-stone-600 font-mono text-xs">{log.action}</td>
                      <td className="px-4 py-3 text-stone-400 text-xs">{log.target_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}
