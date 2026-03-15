import { useEffect, useState } from 'react'

const COLORS = ['#F97316', '#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA']

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) return
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.5,
      size: Math.random() * 8 + 6,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }))
    setPieces(newPieces)
    const timer = setTimeout(() => setPieces([]), 4000)
    return () => clearTimeout(timer)
  }, [active])

  if (!pieces.length) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
