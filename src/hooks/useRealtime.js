import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeOrders(filter, onUpdate) {
  // Keep onUpdate stable — always call the latest version without re-subscribing
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => { onUpdateRef.current = onUpdate }, [onUpdate])

  useEffect(() => {
    if (!filter) return
    const channel = supabase
      .channel(`orders-${filter.key}-${filter.value}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `${filter.key}=eq.${filter.value}`,
      }, (payload) => onUpdateRef.current?.(payload))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [filter?.key, filter?.value])
}
