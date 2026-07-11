'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function cleanErrorMessage(error: any, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback
  const message = error.message
  if (message && message !== '{}') return message
  return fallback
}

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
    let msg = cleanErrorMessage(error)
    if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email not verified')) {
      msg = 'Please verify your email before logging in'
    } else if (msg === 'Invalid login credentials') {
      msg = 'Invalid login credentials (or please verify before login)'
    }
    return { error: msg }
  }

  // Fetch user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, verification_status, phone, address, encrypted_data')
    .eq('id', signInData.user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Could not fetch user profile. Please try again.' }
  }

  const hasPlaintext = Boolean(profile.phone && profile.address)
  const hasEncrypted = Boolean(profile.encrypted_data && Object.keys(profile.encrypted_data).length > 0)
  const isComplete = hasPlaintext || hasEncrypted

  if (!isComplete) {
    redirect('/onboarding')
  }

  if (profile.role === 'donor' && profile.verification_status !== 'verified') {
    return { error: 'Your donor account is pending approval. Please wait for an admin to verify your account.' }
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
  if (profile.role && ['donor', 'ngo', 'volunteer'].includes(profile.role)) {
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

  // Normal signup mode (falls back to email confirmation based on Supabase project settings)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?type=signup`,
    },
  })

  if (error) {
    return { error: cleanErrorMessage(error) }
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/onboarding')
  } else {
    redirect('/verify-email')
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

  // Fallback to standard email reset if no admin client
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  })

  if (error) {
    console.error('[requestPasswordReset] FULL RAW ERROR DETAILS:', {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack,
      properties: Object.getOwnPropertyNames(error).reduce((acc, key) => {
        acc[key] = (error as any)[key];
        return acc;
      }, {} as any)
    })
    const errorMsg = cleanErrorMessage(error, 'Supabase email service error. Please check if SMTP settings are configured correctly in the Supabase Dashboard.')
    return { error: errorMsg, success: false }
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
    return { error: cleanErrorMessage(error) }
  }

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login?message=Password updated successfully. Please log in.')
}
