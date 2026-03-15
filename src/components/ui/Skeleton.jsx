export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function KitchenCardSkeleton() {
  return (
    <div className="glass-card p-0 overflow-hidden">
      <Skeleton className="h-48 rounded-t-2xl rounded-b-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

export function FoodCardSkeleton() {
  return (
    <div className="glass-card p-0 overflow-hidden">
      <Skeleton className="h-40 rounded-t-2xl rounded-b-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )
}
