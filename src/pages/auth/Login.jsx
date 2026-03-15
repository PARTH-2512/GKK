import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const ROLE_REDIRECT = { customer: '/', cook: '/cook/dashboard', admin: '/admin/dashboard' }

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setProfile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    // Step 1: Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })

    if (authError) {
      toast.error(authError.message)
      setSubmitting(false)
      return
    }

    // Step 2: Fetch profile directly
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profileData) {
      toast.error('Could not load your profile. Please try again.')
      await supabase.auth.signOut()
      setSubmitting(false)
      return
    }

    if (profileData.is_banned) {
      toast.error('Your account has been banned. Contact support.')
      await supabase.auth.signOut()
      setSubmitting(false)
      return
    }

    // Step 3: Set context state directly — no waiting on events
    setUser(authData.user)
    setProfile(profileData)

    // Step 4: Navigate
    navigate(ROLE_REDIRECT[profileData.role] || '/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍱</div>
          <h1 className="font-display text-3xl font-bold text-stone-800">Welcome Back</h1>
          <p className="text-stone-500 mt-1">Sign in to Ghar Ka Khana</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" loading={submitting} disabled={submitting} className="w-full mt-2">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 p-3 rounded-xl bg-orange-50 border border-orange-100">
          <p className="text-xs font-medium text-stone-600 mb-2">🎯 Demo Accounts</p>
          <div className="space-y-1 text-xs text-stone-500 font-mono">
            <p>Admin: admin_demo@example.com</p>
            <p>Cook: kitchen_demo@example.com</p>
            <p>Customer: customer1_demo@example.com</p>
            <p className="text-stone-400 mt-1">Password: Demo@123</p>
          </div>
        </div>

        <p className="text-center text-sm text-stone-500 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
