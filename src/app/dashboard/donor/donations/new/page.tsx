import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth-helpers'
import DonationForm from './DonationForm'

export default async function NewDonationPage() {
  const result = await getUserProfile()

  if (!result || !result.user) {
    redirect('/login')
  }

  const { profile } = result

  if (!profile || (profile.role !== 'donor' && profile.role !== 'admin')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-8">
      <DonationForm defaultAddress={profile.address || ''} />
    </div>
  )
}
