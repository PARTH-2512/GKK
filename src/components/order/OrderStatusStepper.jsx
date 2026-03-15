const STEPS = [
  { key: 'pending', label: 'Pending', icon: '🕐' },
  { key: 'accepted', label: 'Accepted', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '📦' },
  { key: 'completed', label: 'Completed', icon: '🎉' },
]

const STATUS_INDEX = { pending: 0, accepted: 1, preparing: 2, ready: 3, completed: 4, cancelled: -1 }

export default function OrderStatusStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="text-2xl">❌</span>
        <span className="text-red-600 font-medium">Order Cancelled</span>
      </div>
    )
  }

  const currentIndex = STATUS_INDEX[status] ?? 0

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex
        const isActive = idx === currentIndex
        const isPending = idx > currentIndex

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500
                ${isCompleted ? 'bg-success shadow-[0_0_12px_rgba(22,163,74,0.4)]' : ''}
                ${isActive ? 'bg-primary shadow-[0_0_16px_rgba(249,115,22,0.5)] scale-110' : ''}
                ${isPending ? 'bg-stone-100' : ''}
              `}>
                {step.icon}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap
                ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-stone-400'}
              `}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 mx-1 transition-all duration-500 flex-shrink-0
                ${idx < currentIndex ? 'bg-success' : 'bg-stone-200'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}
