import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Customer
import Home from './pages/customer/Home'
import KitchenDetail from './pages/customer/KitchenDetail'
import Cart from './pages/customer/Cart'
import Orders from './pages/customer/Orders'
import Profile from './pages/customer/Profile'

// Cook
import KitchenSetup from './pages/cook/KitchenSetup'
import CookDashboard from './pages/cook/CookDashboard'
import ManageMenu from './pages/cook/ManageMenu'
import ManageOrders from './pages/cook/ManageOrders'
import CookSettings from './pages/cook/CookSettings'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageKitchens from './pages/admin/ManageKitchens'
import ManageUsers from './pages/admin/ManageUsers'
import ManageFoods from './pages/admin/ManageFoods'
import AdminLogs from './pages/admin/AdminLogs'
import AdminOrders from './pages/admin/AdminOrders'

export default function App() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #FFE4E6 100%)' }}>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/kitchen/:id" element={<KitchenDetail />} />

        {/* Customer */}
        <Route path="/cart" element={<ProtectedRoute role="customer"><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="customer"><Profile /></ProtectedRoute>} />

        {/* Cook */}
        <Route path="/cook/kitchen-setup" element={<ProtectedRoute role="cook"><KitchenSetup /></ProtectedRoute>} />
        <Route path="/cook/dashboard" element={<ProtectedRoute role="cook"><CookDashboard /></ProtectedRoute>} />
        <Route path="/cook/menu" element={<ProtectedRoute role="cook"><ManageMenu /></ProtectedRoute>} />
        <Route path="/cook/orders" element={<ProtectedRoute role="cook"><ManageOrders /></ProtectedRoute>} />
        <Route path="/cook/settings" element={<ProtectedRoute role="cook"><CookSettings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/kitchens" element={<ProtectedRoute role="admin"><ManageKitchens /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/foods" element={<ProtectedRoute role="admin"><ManageFoods /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute role="admin"><AdminLogs /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
