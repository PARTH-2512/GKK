import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '12px',
                fontFamily: '"DM Sans", sans-serif',
                color: '#1C1917',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
