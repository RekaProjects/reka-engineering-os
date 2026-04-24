'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/notifications/actions'

export function useRealtimeNotifications(userId: string | undefined) {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const unread = useMemo(() => items.filter((n) => !n.read_at).length, [items])

  useEffect(() => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    const supabase = createClient()
    let cancelled = false

    void (async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!cancelled) {
        if (!error && data) setItems(data as Notification[])
        setLoading(false)
      }
    })()

    const channel = supabase
      .channel(`notif-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Notification
          setItems((prev) => [row, ...prev].slice(0, 20))
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [userId])

  const onItemClick = useCallback(
    async (n: Notification) => {
      if (!n.read_at) {
        await markNotificationRead(n.id)
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)))
      }
      if (n.link) router.push(n.link)
    },
    [router],
  )

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead()
    setItems((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })))
    router.refresh()
  }, [router])

  return { items, unread, loading, onItemClick, markAllRead }
}
