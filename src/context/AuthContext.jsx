import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAndSetProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data ?? null)
      return data ?? null
    } catch {
      setProfile(null)
      return null
    }
  }

  useEffect(() => {
    // On mount: check for existing session once
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        await fetchAndSetProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via password reset link — session is set, redirect handled by ResetPassword page
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) return fetchAndSetProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, setUser, setProfile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
