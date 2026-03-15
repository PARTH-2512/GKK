import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()

  // Initial app load — waiting for getSession()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">🍱</div>
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />

  // Logged in but profile missing (edge case: DB issue)
  if (!profile) return <Navigate to="/login" replace />

  // Banned
  if (profile.is_banned) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-sm">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="font-display text-xl font-bold text-stone-800 mb-2">Account Suspended</h2>
          <p className="text-stone-500 text-sm">Your account has been banned. Contact support.</p>
        </div>
      </div>
    )
  }

  // Wrong role — redirect to correct dashboard
  if (role && profile.role !== role) {
    const redirectMap = { customer: '/', cook: '/cook/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={redirectMap[profile.role] || '/'} replace />
  }

  return children
}
