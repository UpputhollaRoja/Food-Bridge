'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', signInData.user.id)
    .single()

  revalidatePath('/', 'layout')
  
  if (profile?.role) {
    redirect(`/dashboard/${profile.role}`)
  } else {
    redirect('/onboarding')
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !role || !fullName) {
    return { error: 'All fields are required' }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  if (adminClient) {
    // Admin mode: Bypass standard signup SMTP rates by creating user directly as verified
    const { data: newUser, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name: fullName,
      }
    })

    if (adminError) {
      return { error: adminError.message }
    }

    // Explicitly set the correct role on the profile in case the DB trigger
    // defaulted to 'donor' due to metadata key differences.
    if (newUser?.user?.id) {
      await adminClient.from('profiles').upsert({
        id: newUser.user.id,
        role,
        full_name: fullName,
        verification_status: (role === 'donor' || role === 'ngo') ? 'pending' : 'verified',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }

    // Programmatically log the user in to establish browser session cookies
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      return { error: `User created, but sign-in failed: ${loginError.message}` }
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding')
  } else {
    // Normal signup mode (falls back to email confirmation based on Supabase project settings)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    // TODO: Before going to production, you must:
    // 1. Re-enable "Confirm email" in Supabase Dashboard (Project Settings > Auth > User Signups > Toggle "Confirm email")
    // 2. Connect a custom SMTP provider (e.g. Resend, Postmark) in the Supabase Dashboard under Project Settings > Auth > SMTP Settings.
    if (data.session) {
      revalidatePath('/', 'layout')
      redirect('/onboarding')
    } else {
      redirect('/verify-email')
    }
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  if (!email) {
    return { error: 'Email is required', success: false }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: '', success: true }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Both fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login?message=Password updated successfully. Please log in.')
}
