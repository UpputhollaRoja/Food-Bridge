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
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-border backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm animate-float">
            <Heart className="h-5 w-5 text-primary-foreground stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-foreground text-lg tracking-tight">Food Bridge</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 md:py-24 space-y-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3.5 py-1 text-xs font-bold text-secondary border border-secondary/20">
            <Sparkles className="h-3 w-3" />
            {content.badge}
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
            {content.headline} <span className="gradient-text-pink-purple">{content.headline_accent}</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
            {content.description}
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 animate-glow-purple-pink"
            >
              <span>{content.cta_primary}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-input bg-card text-sm font-semibold text-foreground hover:bg-muted transition-all duration-300"
            >
              <span>{content.cta_secondary}</span>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="text-center md:text-left md:px-6 flex flex-col justify-center items-center">
            <span className="font-heading text-4xl font-black text-foreground">{stats.donations}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase mt-2">Donations Made</span>
          </div>
          <div className="text-center md:text-left md:px-6 pt-8 md:pt-0 flex flex-col justify-center items-center">
            <span className="font-heading text-4xl font-black text-foreground">{stats.meals}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase mt-2">Meals Delivered</span>
          </div>
          <div className="text-center md:text-left md:px-6 pt-8 md:pt-0 flex flex-col justify-center items-center">
            <span className="font-heading text-4xl font-black text-foreground">{stats.kgSaved}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase mt-2">Kg Food Saved</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground -mt-16">* Placeholder data for demonstration</p>

        {/* How It Works (3 Steps) */}
        <div className="pt-12">
          <h2 className="font-heading text-3xl font-black text-center text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-md text-primary animate-float">
                <Building2 className="h-10 w-10" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground">1. Donor Posts</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Supermarkets and restaurants instantly list surplus food items. AI prioritizes listings based on shelf-life.
              </p>
            </div>
 
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-md text-secondary animate-float" style={{ animationDelay: '0.4s' }}>
                <Heart className="h-10 w-10" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground">2. NGO Claims</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                NGOs browse local listings sorted by AI priority and claim items atomically.
              </p>
            </div>
 
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-md text-primary animate-float" style={{ animationDelay: '0.8s' }}>
                <Navigation className="h-10 w-10" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground">3. Volunteer Delivers</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Volunteers choose unassigned claims, accept delivery tasks, and coordinate handovers.
              </p>
            </div>
          </div>
        </div>

        {/* Environmental impact highlight card */}
        <div className="glass-card-accent rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 mt-16 animate-glow-purple-pink">
          <div className="space-y-3 max-w-lg">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 animate-spin" /> Environmental Balance Sheet
            </span>
            <h3 className="font-heading text-2xl font-bold text-foreground">{content.impact_heading}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {content.impact_body}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:w-80 shrink-0">
            <div className="text-center md:text-left">
              <span className="font-heading text-2xl font-black text-foreground block">{content.impact_stat_1}</span>
              <span className="text-[10px] text-muted-foreground block mt-1 uppercase font-bold">{content.impact_stat_1_label}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-heading text-2xl font-black text-foreground block">{content.impact_stat_2}</span>
              <span className="text-[10px] text-muted-foreground block mt-1 uppercase font-bold">{content.impact_stat_2_label}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-xs mt-12">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link href="/about" className="hover:text-primary transition-colors font-medium">About</Link>
          <Link href="/faq" className="hover:text-primary transition-colors font-medium">FAQ</Link>
          <Link href="/signup" className="hover:text-primary transition-colors font-medium">Get Started</Link>
        </div>
        <p>© {new Date().getFullYear()} Food Bridge. Dedicated to Zero Waste.</p>
      </footer>
    </div>
  )
}
