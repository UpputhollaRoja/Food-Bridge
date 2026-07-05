import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import ContentEditorClient from './ContentEditorClient'

export default async function ContentEditorPage() {
  const result = await getUserProfile()
  if (!result?.user) redirect('/login')

  const { profile } = result
  if (profile?.role !== 'admin') redirect('/dashboard/donor')

  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('site_content')
    .select('*')
    .order('sort_order')

  // Group by page
  const pages: Record<string, typeof rows> = {}
  for (const row of rows ?? []) {
    if (!pages[row.page]) pages[row.page] = []
    pages[row.page]!.push(row)
  }

  return <ContentEditorClient pages={pages} />
}
