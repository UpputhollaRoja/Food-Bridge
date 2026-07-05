'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveContentAction(formData: FormData) {
  const supabase = await createClient()

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  // Collect all key=value pairs from form
  const updates: { page: string; key: string; value: string }[] = []

  for (const [fieldKey, value] of formData.entries()) {
    // fieldKey format: "page__key"
    if (!fieldKey.includes('__')) continue
    const [page, key] = fieldKey.split('__')
    updates.push({ page, key, value: value as string })
  }

  for (const update of updates) {
    await supabase
      .from('site_content')
      .update({ value: update.value, updated_at: new Date().toISOString() })
      .eq('page', update.page)
      .eq('key', update.key)
  }

  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/faq')

  return { success: true }
}
