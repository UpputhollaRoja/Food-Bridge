'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestVerifyPage() {
  const [status, setStatus] = useState('Verifying...')

  useEffect(() => {
    const verify = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setStatus('Not logged in')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('id', user.id)

      if (error) {
        setStatus('Error: ' + error.message)
      } else {
        setStatus('Successfully verified user ' + user.id)
      }
    }

    verify()
  }, [])

  return (
    <div className="p-8 font-mono text-sm">
      <h1>Test Verification Hook</h1>
      <p>{status}</p>
      <a href="/" className="text-blue-500 underline mt-4 block">Return Home</a>
    </div>
  )
}
