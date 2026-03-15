import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Input, { Textarea } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { calcAvgRating } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function CookSettings() {
  const { profile } = useAuth()
  const [kitchen, setKitchen] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ kitchen_name: '', description: '', address: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data: k } = await supabase.from('kitchens').select('*').eq('owner_id', profile.id).single()
      if (!k) return
      setKitchen(k)
      setForm({ kitchen_name: k.kitchen_name, description: k.description || '', address: k.address || '' })
      const { data: r } = await supabase.from('reviews').select('rating').eq('kitchen_id', k.id)
      setReviews(r || [])
    }
    if (profile) fetch()
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('kitchens').update({ kitchen_name: form.kitchen_name, description: form.description, address: form.address }).eq('id', kitchen.id)
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Kitchen updated!')
  }

  const toggleActive = async () => {
    const { error } = await supabase.from('kitchens').update({ is_active: !kitchen.is_active }).eq('id', kitchen.id)
    if (error) toast.error(error.message)
    else { setKitchen(prev => ({ ...prev, is_active: !prev.is_active })); toast.success(kitchen.is_active ? 'Kitchen paused' : 'Kitchen activated') }
  }

  if (!kitchen) return <PageWrapper><div className="text-center py-20 text-stone-400">No kitchen found.</div></PageWrapper>

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-bold text-stone-800">Kitchen Settings</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${kitchen.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {kitchen.status}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 mb-4">
            <div>
              <p className="font-medium text-stone-700 text-sm">Kitchen Status</p>
              <p className="text-xs text-stone-400">{kitchen.is_active ? 'Accepting orders' : 'Not accepting orders'}</p>
            </div>
            <Button variant={kitchen.is_active ? 'secondary' : 'success'} className="text-sm py-1.5 px-4" onClick={toggleActive}>
              {kitchen.is_active ? '⏸ Pause' : '▶ Activate'}
            </Button>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 mb-4">
            <p className="text-sm text-stone-600">Average Rating: <strong className="text-amber-600">{calcAvgRating(reviews)} ⭐</strong> ({reviews.length} reviews)</p>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Kitchen Name" value={form.kitchen_name} onChange={e => setForm({ ...form, kitchen_name: e.target.value })} required />
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
