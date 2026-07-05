'use server'

import { createClient } from '@/lib/supabase/server'

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient()

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
}

export async function markAllReadAction() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
  }
}
