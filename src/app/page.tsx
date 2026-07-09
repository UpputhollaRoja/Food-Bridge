import React from 'react'
import Link from 'next/link'
import { Heart, Sparkles, ArrowRight, ShieldCheck, Bolt, Warehouse, Truck, Home, Globe, Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// Default fallbacks for the new Daylight Design System copy
const defaults = {
  badge: 'Global Logistics Redefined',
  headline: 'A Logistics Revolution for',
  headline_accent: 'Human Impact.',
  description: 'Food Bridge leverages industrial technical precision to eliminate food waste and optimize distribution channels, ensuring nutrients reach the networks that need them most.',
  cta_primary: 'Activate Impact',
  cta_secondary: 'View Roadmap',
  impact_stat_1: '2.5 kg CO2e',
  impact_stat_1_label: 'Saved per kg Food',
  impact_stat_2: '100%',
  impact_stat_2_label: 'Transparent Data',
  impact_heading: 'Saving the Planet, One Delicious Meal at a Time',
  impact_body: 'Food waste generates nearly 10% of global emissions. For every 1 kg redirected through Food Bridge, we avoid 2.5 kg of CO2e. That\'s a huge win for Earth!'
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

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto h-20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-tint dark:bg-gradient-to-br dark:from-[#10B981] dark:to-[#059669] shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-float">
              <Leaf className="h-5 w-5 text-primary dark:text-[#06110D] stroke-[2.5]" />
            </div>
            <span className="font-heading text-2xl font-bold text-primary tracking-tight">Food Bridge</span>
          </div>

          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 text-sm transition-colors" href="/dashboard/donor">Dashboard</Link>
            <a className="text-text-secondary font-medium hover:text-primary transition-colors duration-200 text-sm" href="#infrastructure">Infrastructure</a>
            <a className="text-text-secondary font-medium hover:text-primary transition-colors duration-200 text-sm" href="#systemic">Impact</a>
            <a className="text-text-secondary font-medium hover:text-primary transition-colors duration-200 text-sm" href="#activate">Join Grid</a>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-bold active:scale-95 transition-transform shadow-md hover:brightness-115">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Food Bridge Logistics Hero" 
              className="w-full h-full object-cover brightness-[0.95]" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLudl7k6ti2tlVBMiYelYANVwjYwqLjTTwXqf-5Yqzm8VVBy3mL6CrTe3LbvpEcmqSQ4UTkStAcOIwDR9Uht0Gx316RZjdSD_9YOXykQoJFfdkMpLwIFEB8lPTvl8u2EtFVOKg-A6VEw66d3bxU0otBoVqsBwBWzpsi3zJCIhoc1PDIgA8OENO0LkEJdWAuofdlK9JJrxEV0njfBve0iA_k5TH9b05D6aWHLDAaMZxtwO-osRg-MxJmZC7Bc"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
          </div>

          <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl space-y-8 py-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase font-bold tracking-widest">{content.badge}</span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-6xl text-text-primary leading-tight font-extrabold tracking-tight">
                {content.headline}{' '}
                <span className="cyan-gradient-text">{content.headline_accent}</span>
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed">
                {content.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/signup" className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold active:scale-95 transition-all flex items-center gap-3 shadow-lg hover:shadow-primary/20">
                  {content.cta_primary}
                  <Bolt className="h-5 w-5 fill-current" />
                </Link>
                <Link href="/login" className="border-2 border-primary text-primary bg-background/50 backdrop-blur px-10 py-4 rounded-full font-bold hover:bg-primary/5 active:scale-95 transition-all">
                  {content.cta_secondary}
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-border">
                <div>
                  <p className="font-heading text-3xl text-primary font-bold">12.4M</p>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mt-1">Meals Delivered</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <p className="font-heading text-3xl text-primary font-bold">450+</p>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mt-1">NGO Partners</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <p className="font-heading text-3xl text-primary font-bold">98.2%</p>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mt-1">Fleet Efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure for Good Section */}
        <section id="infrastructure" className="py-24 px-6 md:px-12 bg-card relative overflow-hidden border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 space-y-4">
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary">Infrastructure for Good</h2>
              <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
                Our proprietary routing algorithms and high-frequency data mesh transform standard delivery routes into corridors of hope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Bento Card 1 */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border bg-background p-10 flex flex-col justify-between transition-all hover:shadow-lg duration-300">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Globe className="h-[120px] w-[120px] text-primary" />
                </div>
                <div className="max-w-md">
                  <Warehouse className="text-primary h-10 w-10 mb-6" />
                  <h3 className="font-heading text-2xl font-bold text-text-primary mb-4">Real-time Surplus Mesh</h3>
                  <p className="text-text-secondary mb-8 leading-relaxed">
                    Our platform connects supermarket inventory systems directly to local redistribution hubs, identifying surplus within seconds of shelf clearing.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider">Active Grid</span>
                  <span className="bg-accent-tint text-text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider">V2.4 Protocol</span>
                </div>
              </div>

              {/* Bento Card 2 */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-background p-10 flex flex-col justify-between transition-all hover:shadow-lg duration-300">
                <div>
                  <Truck className="text-primary h-10 w-10 mb-6" />
                  <h3 className="font-heading text-2xl font-bold text-text-primary mb-4">Adaptive Fleet</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Leveraging electric transit to minimize carbon while maximizing neighborhood reach.
                  </p>
                </div>
                <div className="mt-8 rounded-lg overflow-hidden border border-border/30 h-40">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                    alt="Cyan electric delivery vans parked in a row" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8-BqpmruDY_7pnMnIxYI5e-97rVMiJE0WqY2zgbvjGnWVolAQ0eZ5geRNGhfOr0rGGhPAlQjLsgXRgR-STI0Oo_MnTdq8grWuUYhVcGypnqskFXfBVgHMeOPfK_s-o-hSuKLld6P5WyMh0olPYpfHTXGTERJdNN6aMdGov4EH6VeRHkB9ztggmCIIVMnYnww26cnDqvj8auyrgVjWTCcRVCCLCSJJQ-xBb_gnr6h2mr467IQmHhLlng"
                  />
                </div>
              </div>

              {/* Bento Card 3 */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-background p-10 flex flex-col justify-between transition-all hover:shadow-lg duration-300">
                <div>
                  <Bolt className="text-primary h-10 w-10 mb-6" />
                  <h3 className="font-heading text-2xl font-bold text-text-primary mb-4">Precision Analytics</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Data-driven proof of impact at every terminal point. Transparent and auditable.
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%]"></div>
                  </div>
                  <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent-amber w-[62%]"></div>
                  </div>
                </div>
              </div>

              {/* Bento Card 4 */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border bg-background p-10 transition-all hover:shadow-lg duration-300 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="font-heading text-2xl font-bold text-text-primary mb-4">Cold Chain Integrity</h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    IoT sensors monitor thermal stability throughout the journey, ensuring nutrient density is preserved from farm to table.
                  </p>
                  <a className="text-primary font-bold text-sm flex items-center gap-2 hover:translate-x-1 transition-transform" href="#">
                    Explore Technology <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="order-1 md:order-2 rounded-xl overflow-hidden border border-border h-56">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Smart cold-storage containers with digital screens" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAafDIvSix7y9P-A-m6BPFrdkcE8JwptT-Ia1k3kDhDSGxBuiTOWSqBuanXU42azy47J_6xMDcGUDpeyZh-SMJCZvRp1BHF8J1u_w5rAmwKEiEaCthhDHLcEmYQ0I3dqkcJhdX3Q-lDiTe1VgzAZWbBgAhyg_Y3QG_JETdfRCBUxOmiz4I0mg5A8DqFFKtwRvy8f3IZ18hin761-p_TWYg_rBdoyBilMy8PHOFb7MmrGFU3tJ7xuPhg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Systemic Transformation Section */}
        <section id="systemic" className="py-24 px-6 md:px-12 bg-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00f0ff]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#273fff]/10 rounded-full blur-3xl"></div>
              
              <div className="relative bg-background border border-border rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-tint flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-heading text-2xl font-bold text-text-primary">Impact Network</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                    <span className="text-sm font-semibold">Active Delivery Nodes</span>
                    <span className="font-heading text-2xl text-primary font-bold">2,840</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                    <span className="text-sm font-semibold">Monthly GHG Reduction</span>
                    <span className="font-heading text-2xl text-accent-amber font-bold">142t</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                    <span className="text-sm font-semibold">Resource Optimization</span>
                    <span className="font-heading text-2xl text-primary font-bold">+38%</span>
                  </div>
                </div>

                <div className="pt-4 rounded-lg overflow-hidden border border-border">
                  <img 
                    className="w-full h-48 object-cover" 
                    alt="Sophisticated data visualization node map" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5IKHLojyjMhE_Nl4f0J1qC51EUIyNBLw7HZrXTEApuyYMSwZFCA0sgQfZBU_Xd3ck3hJsu7LybuWPvEB_CDDHJDF6oj4pn1O-FPScdHhBNz1e0ShVRYnnrLqCuyb5-h06lpLm0sGErb__9gahUIg6CB7v-lJm_Q2I92LMUBC9yhnDMIV2DMwZdEsKElLDd9osha1v0NBsph1b84Cx7rXz4RrI5NaGG81cqGIih6dFbEigieznvE4zow"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-primary tracking-widest uppercase">Systemic Transformation</span>
                <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary leading-tight">
                  The Impact is <span className="cyan-gradient-text">Systemic.</span>
                </h2>
                <p className="text-lg text-text-secondary leading-relaxed">
                  We don't just move food; we re-engineer the logistics of care. By creating a high-performance network for surplus redistribution, we're building the infrastructure for a zero-waste future.
                </p>
              </div>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h5 className="text-lg font-bold text-text-primary">Zero-Loss Distribution</h5>
                    <p className="text-sm text-text-secondary leading-relaxed mt-1">Our predictive routing ensures that 99% of surplus reaches a final destination before expiration.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h5 className="text-lg font-bold text-text-primary">Sustainable Ecosystems</h5>
                    <p className="text-sm text-text-secondary leading-relaxed mt-1">Every mile traveled is carbon-tracked and offset through localized biodiversity initiatives.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h5 className="text-lg font-bold text-text-primary">Empowering Communities</h5>
                    <p className="text-sm text-text-secondary leading-relaxed mt-1">Direct platform access for local shelters allows them to request specific nutritional needs in real-time.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Ready to Activate CTA Section */}
        <section id="activate" className="py-24 px-6 md:px-12 relative overflow-hidden bg-primary text-primary-foreground mx-4 md:mx-6 rounded-[2.5rem] mb-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, var(--color-success-bg) 0%, transparent 70%)', backgroundSize: '150% 150%' }}></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold">Ready to Activate?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join the network of logistics partners, NGOs, and volunteers building the next generation of human-impact infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/signup" className="bg-background text-primary px-12 py-5 rounded-full font-bold hover:brightness-110 active:scale-95 transition-all shadow-xl">
                Partner with Us
              </Link>
              <Link href="/signup" className="bg-transparent border-2 border-white/30 text-primary-foreground px-12 py-5 rounded-full font-bold hover:bg-white/10 active:scale-95 transition-all">
                Volunteer Grid
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-6 bg-card border-t border-border rounded-t-[2.5rem]">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2.5">
              <Leaf className="h-6 w-6 text-primary stroke-[2.5]" />
              <span className="font-heading text-2xl font-bold text-primary tracking-tight">Food Bridge</span>
            </div>
            <p className="text-xs text-text-tertiary">© {new Date().getFullYear()} Food Bridge Logistics. All rights reserved.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-semibold text-text-secondary">
            <Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
            <Link className="hover:text-primary transition-colors" href="/contact">Contact</Link>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Network Status
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
