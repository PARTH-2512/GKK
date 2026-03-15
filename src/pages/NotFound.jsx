import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-10 text-center max-w-md animate-slide-up">
        <div className="text-7xl mb-4">🍳</div>
        <h1 className="font-display text-4xl font-bold text-stone-800 mb-2">404</h1>
        <p className="text-stone-500 text-lg mb-1">Page Not Found</p>
        <p className="text-stone-400 text-sm mb-8">
          Oops! This dish isn't on the menu. Let's get you back to something delicious.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>← Go Back</Button>
          <Button onClick={() => navigate('/')}>🏠 Home</Button>
        </div>
      </div>
    </div>
  )
}
