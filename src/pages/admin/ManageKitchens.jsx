import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const TABS = ['all', 'pending', 'approved', 'rejected']

export default function ManageKitchens() {
  const { profile } = useAuth()
  const [kitchens, setKitchens] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('kitchens').select('*, users(name, phone)').order('created_at', { ascending: false })
      setKitchens(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const updateStatus = async (kitchenId, status) => {
    const { error } = await supabase.from('kitchens').update({ status }).eq('id', kitchenId)
    if (error) { toast.error(error.message); return }
    await supabase.from('admin_logs').insert({ admin_id: profile.id, action: `${status}_kitchen`, target_type: 'kitchen', target_id: kitchenId })
    setKitchens(prev => prev.map(k => k.id === kitchenId ? { ...k, status } : k))
    toast.success(`Kitchen ${status}`)
  }

  const toggleActive = async (kitchen) => {
    const { error } = await supabase.from('kitchens').update({ is_active: !kitchen.is_active }).eq('id', kitchen.id)
    if (error) { toast.error(error.message); return }
    await supabase.from('admin_logs').insert({ admin_id: profile.id, action: kitchen.is_active ? 'deactivated_kitchen' : 'activated_kitchen', target_type: 'kitchen', target_id: kitchen.id })
    setKitchens(prev => prev.map(k => k.id === kitchen.id ? { ...k, is_active: !k.is_active } : k))
    toast.success(`Kitchen ${kitchen.is_active ? 'deactivated' : 'activated'}`)
  }

  const filtered = tab === 'all' ? kitchens : kitchens.filter(k => k.status === tab)

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Manage Kitchens</h1>
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${tab === t ? 'bg-primary text-white border-primary' : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'pending' && kitchens.filter(k => k.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center">
                {kitchens.filter(k => k.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center"><div className="text-4xl mb-2">🏠</div><p className="text-stone-500">No kitchens found</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(kitchen => (
            <div key={kitchen.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-stone-800">{kitchen.kitchen_name}</h3>
                    <StatusBadge status={kitchen.status} />
                    {!kitchen.is_active && <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-sm text-stone-500">Owner: {kitchen.users?.name} {kitchen.users?.phone ? `(${kitchen.users.phone})` : ''}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{kitchen.city} · Registered {formatDate(kitchen.created_at)}</p>
                  {kitchen.description && <p className="text-sm text-stone-600 mt-1">{kitchen.description}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {kitchen.status === 'pending' && (
                    <>
                      <Button variant="success" className="text-sm py-1.5 px-4" onClick={() => updateStatus(kitchen.id, 'approved')}>✅ Approve</Button>
                      <Button variant="danger" className="text-sm py-1.5 px-4" onClick={() => updateStatus(kitchen.id, 'rejected')}>❌ Reject</Button>
                    </>
                  )}
                  {kitchen.status === 'approved' && (
                    <Button variant="secondary" className="text-sm py-1.5 px-4" onClick={() => toggleActive(kitchen)}>
                      {kitchen.is_active ? '⏸ Deactivate' : '▶ Activate'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
