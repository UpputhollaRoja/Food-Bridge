import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { user, profile } = result

  // If onboarding is already complete, redirect to role dashboard
  const isProfileComplete = (profile && profile.phone && profile.address) || (profile && profile.encrypted_data)
  if (isProfileComplete) {
    redirect(`/dashboard/${profile.role}`)
  }

  return (
    <OnboardingForm 
      userEmail={user.email || ''} 
      userRole={profile?.role || 'donor'} 
      userFullName={profile?.full_name || ''} 
    />
  )
}
