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
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-border backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-tint dark:bg-gradient-to-br dark:from-[#10B981] dark:to-[#059669] shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-float">
            <Heart className="h-5 w-5 text-[#6C5CE7] dark:text-[#06110D] stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-text-primary text-lg tracking-tight">Food Bridge</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[15px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center py-2.5 px-4 bg-primary text-primary-foreground transition-all shadow-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 md:py-24 space-y-24 relative">
        {/* Radial Emerald Glow (Visible in Dark Mode only) */}
        <div className="hidden dark:block absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-8 relative">
          {/* Eyebrow Pill Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-3.5 py-1.5 text-[13px] font-semibold text-[#6C5CE7] dark:text-[#6EE7B7] border border-[rgba(108,92,231,0.3)] dark:border-[rgba(16,185,129,0.35)]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            {content.badge}
          </span>
          
          {/* Headline with inline rotated pill */}
          <h1 className="font-heading text-4xl md:text-[60px] font-black text-text-primary tracking-[-1.5px] leading-[1.1] max-w-4xl mx-auto">
            {content.headline}{' '}
            <span className="inline-flex items-center justify-center px-4 py-1 mx-1.5 rounded-[12px] bg-[#6C5CE7] dark:bg-[#10B981] text-[#FFFFFF] dark:text-[#06110D] text-[24px] md:text-[44px] font-bold rotate-[-1.5deg] align-middle shadow-[0_4px_14px_rgba(108,92,231,0.25)] dark:shadow-[0_4px_14px_rgba(16,185,129,0.25)]">
              {content.headline_accent}
            </span>
          </h1>

          <p className="text-text-secondary text-[17px] md:text-[18px] max-w-[560px] mx-auto leading-[1.6] font-normal">
            {content.description}
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-bold shadow-sm transition-all"
            >
              <span>{content.cta_primary}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[8px] border border-border-strong bg-background text-[15px] font-semibold text-text-primary hover:bg-card transition-all duration-300"
            >
              <span>{content.cta_secondary}</span>
            </Link>
          </div>
        </div>

        {/* Floating Card Composition (Hero Visual) */}
        <div className="relative max-w-4xl mx-auto mt-16 md:mt-24 h-[300px] md:h-[400px] w-full flex items-center justify-center">
          {/* Left Floating Stat Card - Success Highlight */}
          <div className="absolute left-2 md:left-12 top-4 md:top-12 z-20 bg-background border border-border p-4 md:p-6 rounded-2xl shadow-lg -rotate-[3deg] animate-float max-w-[160px] md:max-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-text-tertiary">Real-time Efficiency</span>
            <span className="block text-2xl md:text-4xl font-extrabold text-[#10B981] dark:text-[#10B981] mt-1">94%</span>
            <span className="block text-[11px] text-text-secondary mt-1 font-medium leading-normal">AI Match accuracy rate achieved</span>
          </div>

          {/* Center Dashboard/Map Preview Card */}
          <div className="w-[85%] md:w-[65%] h-[90%] bg-background border border-border rounded-2xl shadow-xl p-4 md:p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6C5CE7] dark:bg-[#10B981] animate-pulse" />
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Active Rescues</span>
              </div>
              <span className="text-[10px] text-text-secondary font-medium">Route #4829</span>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-center py-6 space-y-4">
              <div className="h-1.5 w-full bg-border rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-[#6C5CE7] dark:bg-[#10B981] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <div className="flex items-center gap-1"><span>📦</span> <span className="font-semibold text-text-primary">Supermarket</span></div>
                <div className="flex items-center gap-1"><span className="animate-bounce">🚚</span> <span className="text-[10px] bg-accent-tint text-[#6C5CE7] dark:text-[#06110D] dark:bg-[#10B981] px-1.5 py-0.5 rounded font-bold uppercase">Transit</span></div>
                <div className="flex items-center gap-1"><span>🏠</span> <span className="font-semibold text-text-primary">Shelter</span></div>
              </div>
            </div>
          </div>

          {/* Right Floating Stat Card */}
          <div className="absolute right-2 md:right-12 bottom-4 md:bottom-12 z-20 bg-background border border-border p-4 md:p-6 rounded-2xl shadow-lg rotate-[4deg] animate-float max-w-[160px] md:max-w-[200px]" style={{ animationDelay: '0.6s' }}>
            <span className="text-[10px] uppercase font-bold text-text-tertiary">Impact Tracker</span>
            <span className="block text-2xl md:text-4xl font-extrabold text-[#6C5CE7] dark:text-[#10B981] mt-1">2.5k</span>
            <span className="block text-[11px] text-text-secondary mt-1 font-medium leading-normal">Kg of food rescued this week</span>
          </div>
        </div>

        {/* Trust strip */}
        <div className="py-12 border-t border-border flex flex-col items-center justify-center space-y-6">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Trusted by 500+ organizations</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale dark:invert">
            <span className="font-heading font-black text-lg md:text-xl tracking-tight text-text-primary">SUPERSAVE</span>
            <span className="font-heading font-bold text-lg md:text-xl tracking-tight text-text-primary">HARVEST SHELTER</span>
            <span className="font-heading font-extrabold text-lg md:text-xl tracking-tight text-text-primary">GREENFEED</span>
            <span className="font-heading font-semibold text-lg md:text-xl tracking-tight text-text-primary">RESCUE CO-OP</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="border-t border-border pt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center flex flex-col justify-center items-center space-y-1">
            <span className="font-heading text-[32px] font-extrabold text-[#6C5CE7] dark:bg-gradient-to-r dark:from-[#10B981] dark:to-[#059669] dark:bg-clip-text dark:text-transparent inline-block leading-none">
              {stats.donations}
            </span>
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Donations Made</span>
          </div>
          <div className="text-center flex flex-col justify-center items-center space-y-1">
            <span className="font-heading text-[32px] font-extrabold text-[#6C5CE7] dark:bg-gradient-to-r dark:from-[#10B981] dark:to-[#059669] dark:bg-clip-text dark:text-transparent inline-block leading-none">
              {stats.meals}
            </span>
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Meals Delivered</span>
          </div>
          <div className="text-center flex flex-col justify-center items-center space-y-1">
            <span className="font-heading text-[32px] font-extrabold text-[#6C5CE7] dark:bg-gradient-to-r dark:from-[#10B981] dark:to-[#059669] dark:bg-clip-text dark:text-transparent inline-block leading-none">
              {stats.kgSaved}
            </span>
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Kg Food Saved</span>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-text-tertiary -mt-8">* Placeholder data for demonstration</p>

        {/* How It Works (3 Steps) */}
        <div className="pt-16">
          <h2 className="font-heading text-3xl font-black text-center text-text-primary mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-background border border-border rounded-2xl p-8 flex flex-col items-center text-center space-y-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-border-strong transition-all duration-300">
              <div className="h-16 w-16 rounded-[8px] bg-accent-tint flex items-center justify-center text-[#6C5CE7] dark:bg-gradient-to-br dark:from-[#10B981] dark:to-[#059669] dark:text-[#06110D] animate-float">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary">1. Donor Posts</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                Supermarkets and restaurants instantly list surplus food items. AI prioritizes listings based on shelf-life.
              </p>
            </div>
 
            {/* Step 2 */}
            <div className="bg-background border border-border rounded-2xl p-8 flex flex-col items-center text-center space-y-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-border-strong transition-all duration-300">
              <div className="h-16 w-16 rounded-[8px] bg-accent-tint flex items-center justify-center text-[#6C5CE7] dark:bg-gradient-to-br dark:from-[#10B981] dark:to-[#059669] dark:text-[#06110D] animate-float" style={{ animationDelay: '0.4s' }}>
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary">2. NGO Claims</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                NGOs browse local listings sorted by AI priority and claim items atomically.
              </p>
            </div>
 
            {/* Step 3 */}
            <div className="bg-background border border-border rounded-2xl p-8 flex flex-col items-center text-center space-y-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-border-strong transition-all duration-300">
              <div className="h-16 w-16 rounded-[8px] bg-accent-tint flex items-center justify-center text-[#6C5CE7] dark:bg-gradient-to-br dark:from-[#10B981] dark:to-[#059669] dark:text-[#06110D] animate-float" style={{ animationDelay: '0.8s' }}>
                <Navigation className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary">3. Volunteer Delivers</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                Volunteers choose unassigned claims, accept delivery tasks, and coordinate handovers.
              </p>
            </div>
          </div>
        </div>

        {/* Environmental impact highlight card */}
        <div className="bg-background border border-border-strong rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 mt-16 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-border-strong transition-all duration-300">
          <div className="space-y-3 max-w-lg">
            <span className="text-[10px] font-bold text-[#6C5CE7] dark:text-[#10B981] uppercase tracking-widest flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 animate-spin" /> Environmental Balance Sheet
            </span>
            <h3 className="font-heading text-2xl font-bold text-text-primary">{content.impact_heading}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {content.impact_body}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:w-80 shrink-0">
            <div className="text-center md:text-left">
              <span className="font-heading text-2xl font-black text-text-primary block">{content.impact_stat_1}</span>
              <span className="text-[10px] text-text-tertiary block mt-1 uppercase font-bold">{content.impact_stat_1_label}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-heading text-2xl font-black text-text-primary block">{content.impact_stat_2}</span>
              <span className="text-[10px] text-text-tertiary block mt-1 uppercase font-bold">{content.impact_stat_2_label}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-text-tertiary text-xs mt-12 bg-background">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link href="/about" className="hover:text-text-primary transition-colors font-medium">About</Link>
          <Link href="/faq" className="hover:text-text-primary transition-colors font-medium">FAQ</Link>
          <Link href="/signup" className="hover:text-text-primary transition-colors font-medium">Get Started</Link>
        </div>
        <p>© {new Date().getFullYear()} Food Bridge. Dedicated to Zero Waste.</p>
      </footer>
    </div>
  )
}
