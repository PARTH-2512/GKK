import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setSubmitting(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="font-display text-3xl font-bold text-stone-800">Forgot Password</h1>
          <p className="text-stone-500 mt-1">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📧</div>
            <p className="text-stone-600 mb-2">Reset link sent to <strong>{email}</strong></p>
            <p className="text-stone-400 text-sm mb-6">Check your inbox (and spam folder) for the password reset link.</p>
            <Link to="/login" className="text-primary font-medium hover:underline">← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={submitting} disabled={submitting} className="w-full mt-2">
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-stone-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
