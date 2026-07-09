import React from 'react'
import Link from 'next/link'
import { Heart, Building2, Sparkles, Navigation, Globe, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// Default fallbacks in case DB is empty or fails
const defaults = {
  badge: 'AI-Powered Optimization',
  headline: 'Bridging Surplus Food to those',
  headline_accent: 'in Need',
  description: 'Redistribute edible food waste, optimize delivery routes in real-time, and combat greenhouse emissions using our community-driven coordination network.',
  cta_primary: 'Join the Mission',
  cta_secondary: 'Partner Dashboard',
  impact_stat_1: '2.5 kg',
  impact_stat_1_label: 'CO2e Saved / kg Food',
  impact_stat_2: '100%',
  impact_stat_2_label: 'Transparent Logistics',
  impact_heading: 'Saving the Planet, One Meal at a Time',
  impact_body: 'Food waste generates nearly 10% of global greenhouse gas emissions. For every 1 kg of food surplus redirected through Food Bridge, we avoid an estimated 2.5 kg of CO2e carbon emissions.'
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: contentRows } = await supabase
    .from('site_content')
    .select('key, value')
    .eq('page', 'home')

  const content: Record<string, string> = { ...defaults }
  if (contentRows) {
    for (const row of contentRows) {
      if (row.value) content[row.key] = row.value
    }
  }

  // Placeholder stats for the new Stats Bar
  const stats = {
    donations: '15,240*',
    meals: '45,720*',
    kgSaved: '38,100*'
  }

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0A0F0D] text-[#F5F5F0]">
      {/* Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md sticky top-0 z-40 bg-[#0A0F0D]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-float">
            <Heart className="h-5 w-5 text-[#06110D] stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-[#F5F5F0] text-lg tracking-tight">Food Bridge</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[14px] font-medium text-[#9CA3AF] hover:text-[#F5F5F0] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center py-2.5 px-4 rounded-[9px] text-[14px] font-semibold bg-gradient-to-r from-[#10B981] to-[#059669] text-[#06110D] hover:from-[#34D399] hover:to-[#059669] hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-20 md:py-32 space-y-24 relative">
        {/* Radial Emerald Glow */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-8 relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.08)] px-3.5 py-1.5 text-[13px] font-medium text-[#6EE7B7] border border-[rgba(16,185,129,0.35)]">
            <Sparkles className="h-3.5 w-3.5 text-[#6EE7B7]" />
            {content.badge}
          </span>
          
          <h1 className="font-heading text-4xl md:text-[68px] font-black text-[#F5F5F0] tracking-[-2px] leading-[1.08] max-w-4xl mx-auto">
            {content.headline} <span className="gradient-text-emerald-gold">{content.headline_accent}</span>
          </h1>

          <p className="text-[#9CA3AF] text-[17px] max-w-[620px] mx-auto leading-[1.7] font-normal">
            {content.description}
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[9px] text-[14px] font-bold bg-gradient-to-r from-[#10B981] to-[#059669] text-[#06110D] hover:from-[#34D399] hover:to-[#059669] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all shadow-[0_0_24px_rgba(16,185,129,0.25)]"
            >
              <span>{content.cta_primary}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[9px] border border-[rgba(255,255,255,0.14)] bg-transparent text-[14px] font-semibold text-[#F5F5F0] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.25)] transition-all duration-300"
            >
              <span>{content.cta_secondary}</span>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center flex flex-col justify-center items-center space-y-1">
            <span className="font-heading text-[32px] font-extrabold bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent inline-block leading-none">
              {stats.donations}
            </span>
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Donations Made</span>
          </div>
          <div className="text-center flex flex-col justify-center items-center space-y-1">
            <span className="font-heading text-[32px] font-extrabold bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent inline-block leading-none">
              {stats.meals}
            </span>
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Meals Delivered</span>
          </div>
          <div className="text-center flex flex-col justify-center items-center space-y-1">
            <span className="font-heading text-[32px] font-extrabold bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent inline-block leading-none">
              {stats.kgSaved}
            </span>
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Kg Food Saved</span>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-[#6B7280] -mt-8">* Placeholder data for demonstration</p>

        {/* How It Works (3 Steps) */}
        <div className="pt-16">
          <h2 className="font-heading text-3xl font-black text-center text-[#F5F5F0] mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-[#0F1512] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 flex flex-col items-center text-center space-y-4 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-[rgba(255,255,255,0.14)] transition-all duration-300">
              <div className="h-16 w-16 rounded-[9px] bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] text-[#06110D] animate-float">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#F5F5F0]">1. Donor Posts</h3>
              <p className="text-[14px] text-[#9CA3AF] leading-relaxed">
                Supermarkets and restaurants instantly list surplus food items. AI prioritizes listings based on shelf-life.
              </p>
            </div>
 
            {/* Step 2 */}
            <div className="bg-[#0F1512] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 flex flex-col items-center text-center space-y-4 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-[rgba(255,255,255,0.14)] transition-all duration-300">
              <div className="h-16 w-16 rounded-[9px] bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] text-[#06110D] animate-float" style={{ animationDelay: '0.4s' }}>
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#F5F5F0]">2. NGO Claims</h3>
              <p className="text-[14px] text-[#9CA3AF] leading-relaxed">
                NGOs browse local listings sorted by AI priority and claim items atomically.
              </p>
            </div>
 
            {/* Step 3 */}
            <div className="bg-[#0F1512] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 flex flex-col items-center text-center space-y-4 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-[rgba(255,255,255,0.14)] transition-all duration-300">
              <div className="h-16 w-16 rounded-[9px] bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] text-[#06110D] animate-float" style={{ animationDelay: '0.8s' }}>
                <Navigation className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-[#F5F5F0]">3. Volunteer Delivers</h3>
              <p className="text-[14px] text-[#9CA3AF] leading-relaxed">
                Volunteers choose unassigned claims, accept delivery tasks, and coordinate handovers.
              </p>
            </div>
          </div>
        </div>

        {/* Environmental impact highlight card */}
        <div className="bg-[#0F1512] border border-[rgba(16,185,129,0.35)] rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 mt-16 hover:shadow-[0_0_36px_rgba(16,185,129,0.15)] hover:border-[rgba(16,185,129,0.5)] transition-all duration-300">
          <div className="space-y-3 max-w-lg">
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 animate-spin" /> Environmental Balance Sheet
            </span>
            <h3 className="font-heading text-2xl font-bold text-[#F5F5F0]">{content.impact_heading}</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {content.impact_body}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:w-80 shrink-0">
            <div className="text-center md:text-left">
              <span className="font-heading text-2xl font-black text-[#F5F5F0] block">{content.impact_stat_1}</span>
              <span className="text-[10px] text-[#6B7280] block mt-1 uppercase font-bold">{content.impact_stat_1_label}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-heading text-2xl font-black text-[#F5F5F0] block">{content.impact_stat_2}</span>
              <span className="text-[10px] text-[#6B7280] block mt-1 uppercase font-bold">{content.impact_stat_2_label}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8 text-center text-[#6B7280] text-xs mt-12 bg-[#0A0F0D]">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link href="/about" className="hover:text-[#F5F5F0] transition-colors font-medium">About</Link>
          <Link href="/faq" className="hover:text-[#F5F5F0] transition-colors font-medium">FAQ</Link>
          <Link href="/signup" className="hover:text-[#F5F5F0] transition-colors font-medium">Get Started</Link>
        </div>
        <p>© {new Date().getFullYear()} Food Bridge. Dedicated to Zero Waste.</p>
      </footer>
    </div>
  )
}
