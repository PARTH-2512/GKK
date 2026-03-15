export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`glass-card p-5 ${hover ? 'hover:scale-[1.02] transition-transform duration-300 cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
