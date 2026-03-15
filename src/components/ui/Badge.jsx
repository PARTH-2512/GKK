export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'status-pending',
    accepted: 'status-accepted',
    preparing: 'status-preparing',
    ready: 'status-ready',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    approved: 'status-approved',
    rejected: 'status-rejected',
  }
  return (
    <Badge className={map[status] || 'bg-stone-100 text-stone-600 border-stone-200'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </Badge>
  )
}
