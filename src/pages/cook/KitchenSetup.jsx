import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Input, { Textarea } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function KitchenSetup() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ kitchen_name: '', description: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('kitchens').insert({
      owner_id: profile.id,
      kitchen_name: form.kitchen_name,
      description: form.description,
      address: form.address,
      city: 'Ahmedabad',
      status: 'pending',
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <PageWrapper>
      <div className="max-w-md mx-auto text-center py-16">
        <div className="glass-card p-10">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Pending Approval</h2>
          <p className="text-stone-500 mb-6">Your kitchen has been submitted. Our team will review and approve it shortly.</p>
          <Button onClick={() => navigate('/cook/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏠</div>
            <h1 className="font-display text-3xl font-bold text-stone-800">Register Your Kitchen</h1>
            <p className="text-stone-500 mt-1">Start sharing your homemade food with Ahmedabad</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Kitchen Name *" placeholder="e.g. Maa ki Rasoi" value={form.kitchen_name} onChange={e => setForm({ ...form, kitchen_name: e.target.value })} required />
            <Textarea label="Description" placeholder="Tell customers about your kitchen and specialties..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            <Input label="Address *" placeholder="Your home address in Ahmedabad" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">City</label>
              <p className="input-field bg-stone-50 text-stone-500">Ahmedabad (fixed)</p>
            </div>
            <Button type="submit" loading={loading} className="w-full">Submit for Approval</Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
