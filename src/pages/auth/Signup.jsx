import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const ROLE_REDIRECT = { customer: '/', cook: '/cook/kitchen-setup', admin: '/admin/dashboard' }

export default function Signup() {
  const navigate = useNavigate()
  const { setUser, setProfile } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Client-side validation
    if (form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }
    if (form.phone && !/^[\d\s+\-()]{10,15}$/.test(form.phone.trim())) {
      toast.error('Enter a valid phone number (10–15 digits)')
      return
    }

    setSubmitting(true)

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })

    if (authError) {
      toast.error(authError.message)
      setSubmitting(false)
      return
    }

    if (!authData.user) {
      toast.error('Signup failed — please try again.')
      setSubmitting(false)
      return
    }

    // Step 2: Insert profile row
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role,
      }, { onConflict: 'id' })
      .select()
      .single()

    if (profileError || !profileData) {
      toast.error('Profile creation failed. Please try again.')
      setSubmitting(false)
      return
    }

    // Step 3: Set context directly
    setUser(authData.user)
    setProfile(profileData)

    toast.success('Account created! Welcome 🎉')

    // Step 4: Navigate
    navigate(ROLE_REDIRECT[profileData.role] || '/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍱</div>
          <h1 className="font-display text-3xl font-bold text-stone-800">Join Us</h1>
          <p className="text-stone-500 mt-1">Create your Ghar Ka Khana account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {['customer', 'cook'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => !submitting && setForm({ ...form, role: r })}
                  className={`py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    form.role === r
                      ? 'border-primary bg-orange-50 text-primary'
                      : 'border-stone-200 bg-white/50 text-stone-600 hover:border-orange-200'
                  }`}
                >
                  {r === 'customer' ? '🛒 Customer' : '👨‍🍳 Home Cook'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={submitting} disabled={submitting} className="w-full mt-2">
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
