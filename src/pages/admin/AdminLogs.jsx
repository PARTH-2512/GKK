import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/layout/PageWrapper'
import { formatDateTime } from '../../utils/formatters'

const TARGET_TYPES = ['all', 'user', 'kitchen', 'food', 'order']
const PAGE_SIZE = 20

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let query = supabase.from('admin_logs').select('*, users(name)', { count: 'exact' }).order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      if (filter !== 'all') query = query.eq('target_type', filter)
      const { data, count } = await query
      setLogs(data || [])
      setTotal(count || 0)
      setLoading(false)
    }
    fetch()
  }, [filter, page])

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Admin Logs</h1>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TARGET_TYPES.map(t => (
          <button key={t} onClick={() => { setFilter(t); setPage(0) }} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === t ? 'bg-primary text-white border-primary' : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : (
        <>
          <div className="glass-card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50/80">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Time</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Admin</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Action</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Target Type</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium hidden lg:table-cell">Target ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-400">No logs found</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id} className="border-t border-stone-100 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                      <td className="px-4 py-3 text-stone-700">{log.users?.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-stone-600">{log.action}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-600">{log.target_type}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-300 text-xs font-mono hidden lg:table-cell truncate max-w-[120px]">{log.target_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span>{total} total logs</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-primary disabled:opacity-40 transition-colors">← Prev</button>
              <span className="px-3 py-1.5">Page {page + 1} of {Math.ceil(total / PAGE_SIZE) || 1}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total} className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-primary disabled:opacity-40 transition-colors">Next →</button>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  )
}
