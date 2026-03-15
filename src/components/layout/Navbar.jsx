import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, LogOut, User, ChefHat, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const customerLinks = [
    { to: '/', label: 'Home' },
    { to: '/orders', label: 'My Orders' },
    { to: '/profile', label: 'Profile' },
  ]

  const cookLinks = [
    { to: '/cook/dashboard', label: 'Dashboard' },
    { to: '/cook/menu', label: 'Menu' },
    { to: '/cook/orders', label: 'Orders' },
    { to: '/cook/settings', label: 'Settings' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/kitchens', label: 'Kitchens' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/foods', label: 'Foods' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/logs', label: 'Logs' },
  ]

  const links = profile?.role === 'cook' ? cookLinks : profile?.role === 'admin' ? adminLinks : customerLinks

  const RoleIcon = profile?.role === 'cook' ? ChefHat : profile?.role === 'admin' ? Shield : User

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🍱</span>
            <span className="font-display font-bold text-xl text-stone-800 group-hover:text-primary transition-colors">
              Ghar Ka Khana
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-full text-sm font-medium text-stone-600 hover:text-primary hover:bg-orange-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile?.role === 'customer' && (
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-orange-50 transition-colors">
                <ShoppingCart size={22} className="text-stone-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono animate-bounce-once">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {profile ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
                  <RoleIcon size={14} className="text-primary" />
                  <span className="text-sm font-medium text-stone-700">{profile.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full hover:bg-red-50 text-stone-500 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-stone-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/40 bg-white/80 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-orange-50 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
