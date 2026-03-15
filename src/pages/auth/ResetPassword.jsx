import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    // and fires a PASSWORD_RECOVERY event; we just need to wait for the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also check if we already have a session (user clicked link and was auto-logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (submitting) return

    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      navigate('/login', { replace: true })
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md animate-slide-up">
          <div className="text-5xl mb-4 animate-bounce">🔐</div>
          <p className="text-stone-500">Verifying your reset link...</p>
          <p className="text-stone-400 text-sm mt-2">If this takes too long, the link may have expired. <a href="/forgot-password" className="text-primary hover:underline">Request a new one</a>.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="font-display text-3xl font-bold text-stone-800">Set New Password</h1>
          <p className="text-stone-500 mt-1">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" loading={submitting} disabled={submitting} className="w-full mt-2">
            {submitting ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
