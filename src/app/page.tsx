import React from 'react'
import Link from 'next/link'
import { Heart, Sparkles, ArrowRight, ShieldCheck, Bolt, Warehouse, Truck, Home, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// Default fallbacks in case DB is empty or fails
const defaults = {
  badge: 'Sustainable Logistics Platform',
  headline: 'Bridging Surplus Food to',
  headline_accent: 'those in Need',
  description: 'Redistribute edible food waste, optimize delivery routes in real-time, and combat greenhouse emissions using our community-driven coordination network.',
  cta_primary: 'Join the Mission',
  cta_secondary: 'Partner Dashboard',
  impact_stat_1: '2.5 kg CO2e',
  impact_stat_1_label: 'Saved per kg Food',
  impact_stat_2: '100%',
  impact_stat_2_label: 'Transparent Data',
  impact_heading: 'Saving the Planet, One Delicious Meal at a Time',
  impact_body: "Food waste generates nearly 10% of global emissions. For every 1 kg redirected through Food Bridge, we avoid 2.5 kg of CO2e. That's a huge win for Earth!"
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

  // Live metrics data
  const stats = {
    donations: '15,240*',
    meals: '45,720*',
    kgSaved: '38,100*'
  }

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-tint dark:bg-gradient-to-br dark:from-[#10B981] dark:to-[#059669] shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-float">
              <Heart className="h-5 w-5 text-[#6C5CE7] dark:text-[#06110D] stroke-[2.5]" />
            </div>
            <span className="font-heading font-black text-text-primary text-lg tracking-tight">Food Bridge</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200" href="#how-it-works">How It Works</a>
            <a className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200" href="#impact">Impact</a>
            <a className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200" href="#about">About</a>
            <a className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200" href="#faq">FAQ</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Log In</Link>
            <Link href="/signup" className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold shadow-sm transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Main Hero and Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          {/* Radial Emerald Glow (Visible in Dark Mode only) */}
          <div className="hidden dark:block absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none -z-10" />

          <div className="space-y-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-3.5 py-1.5 text-[13px] font-semibold text-[#6C5CE7] dark:text-[#6EE7B7] border border-[rgba(108,92,231,0.3)] dark:border-[rgba(16,185,129,0.35)]">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>{content.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-[1.1] tracking-tight">
              {content.headline}{' '}
              <span className="inline-flex items-center justify-center px-4 py-1 mx-1.5 rounded-[12px] bg-[#6C5CE7] dark:bg-[#10B981] text-[#FFFFFF] dark:text-[#06110D] text-[24px] md:text-[44px] font-bold rotate-[-1.5deg] align-middle shadow-[0_4px_14px_rgba(108,92,231,0.25)] dark:shadow-[0_4px_14px_rgba(16,185,129,0.25)]">
                {content.headline_accent}
              </span>
            </h1>

            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
              {content.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/signup" className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-bold shadow-md hover:-translate-y-0.5 active:scale-95 transition-all">
                {content.cta_primary}
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center px-10 py-4 border-2 border-border-strong text-text-primary font-bold rounded-[8px] bg-background hover:bg-card active:scale-95 transition-all">
                {content.cta_secondary}
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-border">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-card border-2 border-background overflow-hidden">
                  <img alt="User 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA27SvcBqUw0v6ViR8fQ3VPBlkpjvGHZENG-oweJnXZcqVD1VhFiw7dHPX4icES0GY0PAG7iZcHK76_G_ZVnasUmtxJU-n5qFXngiy6D8a_964qXN__ksApUedC7vsfcFoFOW2U7qJWeuIPJ1zIbWf_KtX-uVOqZ9EqoBQkQGayWnUrSdCDxrZwf5ukIcPBFmFzXnaKzF0u_ioSzn_V-mv-k8O3HZp5H-Gul-fAxdyqct9gHbOF2f6n0HWJrhyxzXXTCf0Sczx8vu09"/>
                </div>
                <div className="w-10 h-10 rounded-full bg-card border-2 border-background overflow-hidden">
                  <img alt="User 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6py81isWVOmLrfM5-UjPxpGMzTj22DCKYuxZUebU0mmU-vDTvfkSTejVFSXMY6na5cF44nzLLk4Yk6EXFlXsmwQmap4WlhGxS--QqSl8EYwIHBJJgZDOQrewW8DMdPKla4UjTOtNLfuh8JSHRdAleY5d1Nmoy0lDVBE7bf8Pzna1odghFO9cltJsvN6X01DK738dDNIMCE_dQJL1npmfa34dKYk18gHIMCKASqdwwcq6kXXr3iHII7Z8tC1BXO0zNJyGub9WfY2OP"/>
                </div>
                <div className="w-10 h-10 rounded-full bg-card border-2 border-background overflow-hidden">
                  <img alt="User 3" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgpXJ6PTFOBHoUWTYYvqm1CiLefZICnwFeVZSgCiNC6Hk_cRIDPjyb1OC2LojVSp6XtQo2YMvMSj7kQAJi4hdPcR7YJ44ZL_fduQNbBvGvyBd9IHQ948wukWqAqFT4pywlcWVzrOtEI3_Aw4SpAKC5ZPaErzdasKRoBPbj5csZR-ZsvJ3s2Ist5nJLHBFy8RyvlVN2dV5T6LPIGl6BScz-c3Z03tqpNWH_EiHgW2IRYIyEjXlGRLv9dkTjQRec-2UkYWNmKreGMMb_"/>
                </div>
              </div>
              <p className="text-sm font-medium text-text-secondary">Trusted by <span className="font-bold text-primary">500+</span> organizations worldwide</p>
            </div>
          </div>

          {/* Bento Dashboard Preview */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {/* Impact Tracker Card */}
              <div className="col-span-2 bg-background border border-border p-6 rounded-2xl shadow-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">Impact Tracker</p>
                  <h3 className="text-3xl font-extrabold text-text-primary mt-1">2.5k Kg</h3>
                  <p className="text-sm text-text-secondary font-medium">food rescued this week</p>
                </div>
                <div className="h-20 w-32 flex items-end gap-2 shrink-0">
                  <div className="bg-primary/20 w-full h-1/3 rounded-full"></div>
                  <div className="bg-primary/40 w-full h-1/2 rounded-full"></div>
                  <div className="bg-primary/60 w-full h-3/4 rounded-full"></div>
                  <div className="bg-primary w-full h-full rounded-full"></div>
                </div>
              </div>

              {/* Efficiency Card */}
              <div className="bg-background border border-border p-6 rounded-2xl shadow-lg hover:shadow-xl hover:border-border-strong transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-accent-tint flex items-center justify-center text-primary mb-4">
                  <Bolt className="h-6 w-6" />
                </div>
                <p className="text-xs text-text-secondary font-bold uppercase">Efficiency</p>
                <h4 className="text-3xl font-black text-text-primary mt-1">94%</h4>
                <p className="text-xs text-accent-amber font-bold mt-1">AI Match Accuracy</p>
              </div>

              {/* Route Card */}
              <div className="bg-background border border-border p-6 rounded-2xl shadow-lg hover:shadow-xl hover:border-border-strong transition-all duration-300 relative overflow-hidden">
                <p className="text-xs text-text-secondary font-bold uppercase mb-4">Active Rescue #4829</p>
                <div className="flex flex-col gap-4 relative">
                  <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-primary/20 border-dashed border-l"></div>
                  
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px]">
                      <Warehouse className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-semibold">Supermarket</span>
                  </div>
                  
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-accent-tint flex items-center justify-center text-primary text-[10px]">
                      <Truck className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">Transit</span>
                  </div>
                  
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-accent-tint flex items-center justify-center text-primary text-[10px]">
                      <Home className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-semibold">Shelter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Live Badge */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-3 px-6 rounded-full shadow-xl hidden md:flex items-center gap-3 animate-bounce">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              <span className="text-xs font-bold tracking-tight">Optimizing Live Route</span>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="impact" className="bg-card py-16 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-12">Powering impact for global partners</p>
            <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-45 dark:invert">
              <div className="text-xl font-bold text-text-primary tracking-tighter">SUPERSAVE</div>
              <div className="text-xl font-bold text-text-primary tracking-tighter italic">HARVEST SHELTER</div>
              <div className="text-xl font-bold text-text-primary tracking-tighter font-serif">GREENFEED</div>
              <div className="text-xl font-bold text-text-primary tracking-tighter uppercase font-mono">RESCUE CO-OP</div>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-border-strong transition-all duration-300">
              <div className="text-5xl font-black text-primary mb-3">{stats.donations}</div>
              <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Donations Made</div>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-border-strong transition-all duration-300">
              <div className="text-5xl font-black text-primary mb-3">{stats.meals}</div>
              <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Meals Delivered</div>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-border-strong transition-all duration-300">
              <div className="text-5xl font-black text-primary mb-3">{stats.kgSaved}</div>
              <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Kg Food Saved</div>
            </div>
          </div>
          <p className="text-center text-xs text-text-tertiary mt-12 italic">* Live verified impact data for demonstration</p>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-text-primary mb-4">How It Works</h2>
            <p className="text-lg text-text-secondary max-w-xl mx-auto">Our coordinated logic ensures that no edible food ends up in a landfill.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] bg-border z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-8 group-hover:scale-105 transition-transform duration-300 font-black text-2xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary mb-3">Donor Posts</h4>
                <p className="text-sm text-text-secondary leading-relaxed px-4">Supermarkets and restaurants instantly list surplus food items. AI prioritizes listings based on shelf-life.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-8 group-hover:scale-105 transition-transform duration-300 font-black text-2xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary mb-3">NGO Claims</h4>
                <p className="text-sm text-text-secondary leading-relaxed px-4">NGOs browse local listings sorted by AI priority and claim items atomically with one click.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-8 group-hover:scale-105 transition-transform duration-300 font-black text-2xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary mb-3">Volunteer Delivers</h4>
                <p className="text-sm text-text-secondary leading-relaxed px-4">Volunteers choose unassigned claims, accept delivery tasks, and coordinate seamless handovers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Section */}
        <section id="about" className="bg-primary text-primary-foreground py-20 overflow-hidden relative mx-4 md:mx-6 rounded-[2.5rem]">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 4px 4px, white 2px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-background rounded-full text-primary text-xs font-black uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-[#6C5CE7] dark:text-[#10B981]" />
                <span>Joyful Impact Report</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight">
                Saving the Planet, <br /><span className="text-accent-tint dark:text-[#6EE7B7]">One Delicious Meal</span> at a Time
              </h2>
              <p className="text-lg opacity-90 leading-relaxed font-normal">
                {content.impact_body}
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="bg-background p-8 rounded-2xl flex-1 min-w-[240px] text-center shadow-xl hover:-translate-y-0.5 transition-all">
                  <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">Eco Savings</p>
                  <p className="text-4xl font-extrabold text-text-primary">{content.impact_stat_1}</p>
                  <p className="text-xs font-bold text-text-secondary mt-1">{content.impact_stat_1_label}</p>
                </div>
                <div className="bg-background p-8 rounded-2xl flex-1 min-w-[240px] text-center shadow-xl hover:-translate-y-0.5 transition-all">
                  <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">Trust Score</p>
                  <p className="text-4xl font-extrabold text-text-primary">{content.impact_stat_2}</p>
                  <p className="text-xs font-bold text-text-secondary mt-1">{content.impact_stat_2_label}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative w-full aspect-square max-w-md bg-white/20 rounded-full flex items-center justify-center p-8">
                <div className="absolute inset-0 border-8 border-white/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
                <div className="absolute inset-8 border-4 border-dashed border-white/40 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                <div className="text-center p-12 bg-background rounded-full aspect-square flex flex-col justify-center items-center shadow-2xl scale-110">
                  <Globe className="h-[90px] w-[90px] text-primary" />
                  <div className="mt-4 text-xl font-black text-text-primary tracking-tighter">MISSION ZERO</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="faq" className="bg-card w-full py-16 px-6 mt-16 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-6">
            <span className="text-3xl font-bold text-primary tracking-tight">Food Bridge</span>
            <p className="text-sm font-medium text-text-secondary leading-relaxed">
              Professional logistics for human impact. Reducing food waste through intelligent, joyful coordination.
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-black text-primary uppercase tracking-widest">Quick Links</p>
            <ul className="space-y-3">
              <li><Link className="text-sm font-bold text-text-secondary hover:text-primary transition-colors" href="/about">About</Link></li>
              <li><Link className="text-sm font-bold text-text-secondary hover:text-primary transition-colors" href="/impact">Impact</Link></li>
              <li><Link className="text-sm font-bold text-text-secondary hover:text-primary transition-colors" href="/careers">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-black text-primary uppercase tracking-widest">Support</p>
            <ul className="space-y-3">
              <li><Link className="text-sm font-bold text-text-secondary hover:text-primary transition-colors" href="/faq">FAQ</Link></li>
              <li><Link className="text-sm font-bold text-text-secondary hover:text-primary transition-colors" href="/contact">Contact</Link></li>
              <li><Link className="text-sm font-bold text-text-secondary hover:text-primary transition-colors" href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-black text-primary uppercase tracking-widest">Subscribe</p>
            <div className="flex gap-2">
              <input className="flex-1 bg-background border border-border rounded-full px-5 py-3 text-sm focus:ring-primary focus:border-primary shadow-inner" placeholder="Your email..." type="email"/>
              <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 shadow-lg transition-all">Join</button>
            </div>
            <p className="text-xs font-bold text-text-secondary italic">Stay updated on our local impact.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-text-secondary">© {new Date().getFullYear()} Food Bridge. Let's make a difference together!</p>
          <div className="flex gap-6 text-text-secondary">
            <a className="hover:text-primary transition-transform hover:scale-110" href="#"><span className="text-sm">Public</span></a>
            <a className="hover:text-primary transition-transform hover:scale-110" href="#"><span className="text-sm">Group</span></a>
            <a className="hover:text-primary transition-transform hover:scale-110" href="#"><span className="text-sm">Mail</span></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
