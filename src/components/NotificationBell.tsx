'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { markNotificationReadAction, markAllReadAction } from '@/app/notifications/actions'
import { Bell, Check, Info, Inbox } from 'lucide-react'

interface Notification {
  id: string
  type: string
  payload: {
    message: string
    donation_title?: string
    donation_id?: string
  }
  read: boolean
  created_at: string
}

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isOpen, setIsOpen] = React.useState(false)

  const supabase = createClient()

  const [mounted, setMounted] = React.useState(false)

  // Fetch initial notifications
  React.useEffect(() => {
    setMounted(true)
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter((n) => !n.read).length)
      }
    }

    fetchNotifications()

    // Subscribe to Realtime notifications for this specific user
    const channel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((count) => count + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((count) => Math.max(0, count - 1))
    await markNotificationReadAction(id)
  }

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    await markAllReadAction()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:text-foreground hover:bg-muted transition-colors shadow-sm"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-card border border-border p-4 shadow-2xl z-50 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-heading font-bold text-foreground text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Inbox className="h-8 w-8 text-muted-foreground/50" />
                  <span className="text-xs">No notifications yet</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      n.read
                        ? 'bg-transparent border-transparent hover:bg-muted/50'
                        : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    <div className={`mt-0.5 rounded-lg p-1.5 ${n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      <Info className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className={`text-xs leading-relaxed ${n.read ? 'text-muted-foreground' : 'text-foreground font-semibold'}`}>
                        {n.payload.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80 block">
                        {mounted ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
