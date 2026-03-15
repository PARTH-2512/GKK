import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('users').update({ name: form.name, phone: form.phone }).eq('id', profile.id)
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated!'); refreshProfile() }
  }

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center text-3xl font-bold text-orange-700 mx-auto mb-3">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h1 className="font-display text-2xl font-bold text-stone-800">{profile?.name}</h1>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-orange-50 text-primary text-xs font-medium capitalize">{profile?.role}</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Email</label>
              <p className="input-field bg-stone-50 text-stone-500 cursor-not-allowed">{user?.email || '—'}</p>
            </div>
            <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
