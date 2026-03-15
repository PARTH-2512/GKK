import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function ManageUsers() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('users').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  const toggleBan = async (user) => {
    const newBan = !user.is_banned
    const { error } = await supabase.from('users').update({ is_banned: newBan }).eq('id', user.id)
    if (error) { toast.error(error.message); return }
    await supabase.from('admin_logs').insert({ admin_id: profile.id, action: newBan ? 'banned_user' : 'unbanned_user', target_type: 'user', target_id: user.id })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: newBan } : u))
    toast(newBan ? '⚠️ User has been banned' : '✅ User unbanned', { icon: newBan ? '⚠️' : '✅' })
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Manage Users</h1>
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50/80">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className={`border-t border-stone-100 hover:bg-stone-50/50 ${user.is_banned ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-stone-800">{user.name}</td>
                    <td className="px-4 py-3 text-stone-500 hidden sm:table-cell">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'cook' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs hidden md:table-cell">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      {user.is_banned ? <span className="text-xs text-red-600 font-medium">Banned</span> : <span className="text-xs text-green-600 font-medium">Active</span>}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <Button
                          variant={user.is_banned ? 'success' : 'danger'}
                          className="text-xs py-1 px-3"
                          onClick={() => toggleBan(user)}
                        >
                          {user.is_banned ? 'Unban' : 'Ban'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
