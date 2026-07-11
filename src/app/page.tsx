import React from 'react';
import Link from 'next/link';
import ClientScrollAnimations from '@/components/ClientScrollAnimations';
import { createAdminClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = createAdminClient();
  let totalDonations = 0;
  let mealsDelivered = 0;
  let kgSaved = 0;
  let weeklyRescued = 0;

  if (supabase) {
    const { count } = await supabase.from('donations').select('*', { count: 'exact', head: true });
    totalDonations = count || 0;

    const { data: delivered } = await supabase
      .from('donations')
      .select('estimated_meals, quantity, created_at')
      .in('status', ['delivered', 'completed']);

    if (delivered) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      delivered.forEach(d => {
        mealsDelivered += Number(d.estimated_meals) || 0;
        kgSaved += Number(d.quantity) || 0;
        if (new Date(d.created_at) >= oneWeekAgo) {
          weeklyRescued += Number(d.quantity) || 0;
        }
      });
    }
  }

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  };

  return (
    <div className="bg-background text-on-surface overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight">Food Bridge</span>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200" href="#how-it-works">How It Works</Link>
<Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200" href="#impact">Impact</Link>
<Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200" href="/about">About</Link>
<Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200" href="/faq">FAQ</Link>     
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-1 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Log In</Link>
            <Link href="/signup" className="px-5 py-3 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 active:scale-95 transition-all shadow-[0_8px_16px_rgba(37,99,235,0.2)]">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-all duration-1000 opacity-100 translate-y-0 py-12 lg:py-16 animate-fade-in-up">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">eco</span>
              <span>Sustainable Logistics Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-on-background leading-[1.1] tracking-tight">Bridging Surplus Food to <span className="text-primary">those in Need</span></h1>
            <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">Redistribute edible food waste, optimize delivery routes in real-time, and combat greenhouse emissions using our community-driven coordination network.</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-base">
              <Link href="/signup" className="px-10 py-4 bg-blue-600 text-white font-bold text-center rounded-full shadow-[0_8px_16px_rgba(37,99,235,0.2)] hover:bg-blue-700 active:scale-95 transition-all">Join the Mission</Link>
              <Link href="/dashboard" className="px-10 py-4 border-2 border-primary text-primary font-bold text-center rounded-full hover:bg-primary/5 active:scale-95 transition-all">Partner Dashboard</Link>
            </div>
            <div className="flex items-center gap-2 pt-md border-t border-outline-variant/30">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white overflow-hidden">
                  <img alt="User 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA27SvcBqUw0v6ViR8fQ3VPBlkpjvGHZENG-oweJnXZcqVD1VhFiw7dHPX4icES0GY0PAG7iZcHK76_G_ZVnasUmtxJU-n5qFXngiy6D8a_964qXN__ksApUedC7vsfcFoFOW2U7qJWeuIPJ1zIbWf_KtX-uVOqZ9EqoBQkQGayWnUrSdCDxrZwf5ukIcPBFmFzXnaKzF0u_ioSzn_V-mv-k8O3HZp5H-Gul-fAxdyqct9gHbOF2f6n0HWJrhyxzXXTCf0Sczx8vu09" />
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white overflow-hidden">
                  <img alt="User 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6py81isWVOmLrfM5-UjPxpGMzTj22DCKYuxZUebU0mmU-vDTvfkSTejVFSXMY6na5cF44nzLLk4Yk6EXFlXsmwQmap4WlhGxS--QqSl8EYwIHBJJgZDOQrewW8DMdPKla4UjTOtNLfuh8JSHRdAleY5d1Nmoy0lDVBE7bf8Pzna1odghFO9cltJsvN6X01DK738dDNIMCE_dQJL1npmfa34dKYk18gHIMCKASqdwwcq6kXXr3iHII7Z8tC1BXO0zNJyGub9WfY2OP" />
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white overflow-hidden">
                  <img alt="User 3" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgpXJ6PTFOBHoUWTYYvqm1CiLefZICnwFeVZSgCiNC6Hk_cRIDPjyb1OC2LojVSp6XtQo2YMvMSj7kQAJi4hdPcR7YJ44ZL_fduQNbBvGvyBd9IHQ948wukWqAqFT4pywlcWVzrOtEI3_Aw4SpAKC5ZPaErzdasKRoBPbj5csZR-ZsvJ3s2Ist5nJLHBFy8RyvlVN2dV5T6LPIGl6BScz-c3Z03tqpNWH_EiHgW2IRYIyEjXlGRLv9dkTjQRec-2UkYWNmKreGMMb_" />
                </div>
              </div>
              <p className="text-sm font-medium text-on-surface-variant">Trusted by <span className="font-bold text-primary">500+</span> organizations worldwide</p>
            </div>
          </div>
          {/* Bento Dashboard Preview */}
          <div className="relative animate-fade-in-up delay-100">
            <div className="grid grid-cols-2 gap-6">
              {/* Impact Tracker Card */}
              <div className="col-span-2 bg-white p-6 rounded-3xl card-shadow hover-lift flex justify-between items-center border-2 border-primary-fixed">
                <div>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">Impact Tracker</p>
                  <h3 className="text-4xl font-bold text-on-background mt-1">{formatNumber(weeklyRescued)} Kg</h3>
                  <p className="text-sm text-on-surface-variant font-medium">food rescued this week</p>
                </div>
                <div className="h-20 w-32 flex items-end gap-2">
                  <div className="bg-primary-fixed w-full h-1/3 rounded-full"></div>
                  <div className="bg-primary/20 w-full h-1/2 rounded-full"></div>
                  <div className="bg-primary/50 w-full h-3/4 rounded-full"></div>
                  <div className="bg-primary w-full h-full rounded-full"></div>
                </div>
              </div>
              {/* Efficiency Card */}
              <div className="bg-white p-6 rounded-3xl card-shadow hover-lift">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <p className="text-xs text-on-surface-variant font-bold uppercase">Efficiency</p>
                <h4 className="text-3xl font-bold text-on-surface">94%</h4>
                <p className="text-xs text-primary font-bold">AI Match Accuracy</p>
              </div>
              {/* Route Card */}
              <div className="bg-white p-6 rounded-3xl card-shadow hover-lift relative overflow-hidden">
                <p className="text-xs text-on-surface-variant font-bold uppercase mb-4">Active Rescue #4829</p>
                <div className="flex flex-col gap-4 relative">
                  <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-primary/20 border-dashed border-l"></div>
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                      <span className="material-symbols-outlined text-[14px]">store</span>
                    </div>
                    <span className="text-sm font-medium">Supermarket</span>
                  </div>
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-primary text-[10px]">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                    </div>
                    <span className="text-sm font-medium text-on-surface-variant">Transit</span>
                  </div>
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed text-[10px]">
                      <span className="material-symbols-outlined text-[14px]">home</span>
                    </div>
                    <span className="text-sm font-medium">Shelter</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-3 px-6 rounded-full shadow-xl hidden md:flex items-center gap-3 animate-bounce">
              <span className="material-symbols-outlined fill text-white">verified</span>
              <span className="text-xs font-bold tracking-tight">Optimizing Live Route</span>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-surface-container-low transition-all duration-1000 opacity-100 translate-y-0 py-10">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <p className="text-center text-xs font-bold text-outline uppercase tracking-[0.2em] mb-12">Powering impact for global partners</p>
            <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-50">
              <div className="text-xl font-bold text-on-surface-variant tracking-tighter">SUPERSAVE</div>
              <div className="text-xl font-bold text-on-surface-variant tracking-tighter italic">HARVEST SHELTER</div>
              <div className="text-xl font-bold text-on-surface-variant tracking-tighter">GREENFEED</div>
              <div className="text-xl font-bold text-on-surface-variant tracking-tighter uppercase">RESCUE CO-OP</div>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section id="impact" className="max-w-[1280px] mx-auto px-4 md:px-8 transition-all duration-1000 opacity-100 translate-y-0 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-8 rounded-3xl bg-surface-container hover-lift border border-primary/5" style={{ transition: '0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div className="text-5xl font-bold text-primary mb-2">{totalDonations.toLocaleString()}</div>
              <div className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Donations Made</div>
            </div>
            <div className="p-8 rounded-3xl bg-primary-fixed/30 hover-lift border border-primary/5">
              <div className="text-5xl font-bold text-primary mb-2">{mealsDelivered.toLocaleString()}</div>
              <div className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Meals Delivered</div>
            </div>
            <div className="p-8 rounded-3xl bg-surface-container-highest/30 hover-lift border border-primary/5" style={{ transition: '0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div className="text-5xl font-bold text-primary mb-2">{kgSaved.toLocaleString()}</div>
              <div className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Kg Food Saved</div>
            </div>
          </div>
          <p className="text-center text-xs text-outline mt-12 italic">* Live verified impact data</p>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-[1280px] mx-auto px-4 md:px-8 transition-all duration-1000 opacity-100 translate-y-0 py-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-on-surface mb-4">How It Works</h2>
            <p className="text-lg text-on-surface-variant max-w-xl mx-auto">Our coordinated logic ensures that no edible food ends up in a landfill.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 relative gap-8">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[4px] bg-primary-fixed rounded-full z-0"></div>
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold">1</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-3">Donor Posts</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed px-4">Supermarkets and restaurants instantly list surplus food items. AI prioritizes listings based on shelf-life.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-surface-tint text-white flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold">2</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-3">NGO Claims</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed px-4">NGOs browse local listings sorted by AI priority and claim items atomically with one click.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-on-surface mb-3">Volunteer Delivers</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed px-4">Volunteers choose unassigned claims, accept delivery tasks, and coordinate seamless handovers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Section */}
        <section className="bg-primary-container text-on-primary text-on-primary-container overflow-hidden relative m-4 md:m-8 rounded-[3rem] py-16 animate-fade-in-up delay-200">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 4px 4px, white 2px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-primary text-xs font-black uppercase tracking-[0.15em]">
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span>Joyful Impact Report</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Saving the Planet, <br />One Delicious Meal at a Time</h2>
              <p className="text-lg opacity-90 leading-relaxed font-medium">
                Food waste generates nearly 10% of global emissions. For every 1 kg redirected through Food Bridge, we avoid 2.5 kg of CO2e. That's a huge win for Earth!
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="bg-white p-8 rounded-[2rem] flex-1 min-w-[240px] text-center shadow-xl hover-lift">
                  <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">Eco Savings</p>
                  <p className="text-4xl font-bold text-on-background">2.5 kg CO2e</p>
                  <p className="text-xs font-bold text-on-surface-variant opacity-60">Saved per kg Food</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] flex-1 min-w-[240px] text-center shadow-xl hover-lift">
                  <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">Trust Score</p>
                  <p className="text-4xl font-bold text-on-background">100%</p>
                  <p className="text-xs font-bold text-on-surface-variant opacity-60">Transparent Data</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full aspect-square max-w-md bg-white/20 rounded-full flex items-center justify-center p-8">
                <div className="absolute inset-0 border-8 border-white/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
                <div className="absolute inset-8 border-4 border-dashed border-white/40 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                <div className="text-center p-10 bg-white rounded-full aspect-square flex flex-col justify-center items-center shadow-2xl scale-110 animate-float">
                  <span className="material-symbols-outlined text-[100px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                  <div className="mt-4 text-2xl font-black text-on-surface tracking-tighter">MISSION ZERO</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high w-full py-20 px-4 md:px-8 rounded-t-[3rem]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-6">
            <span className="text-3xl font-bold text-primary tracking-tight">Food Bridge</span>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
              Professional logistics for human impact. Reducing food waste through intelligent, joyful coordination.
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-black text-primary uppercase tracking-widest">Quick Links</p>
            <ul className="space-y-3">
              <li><Link className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors" href="/about">About</Link></li>
              <li><Link className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors" href="#impact">Impact</Link></li>
              <li><Link className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors" href="mailto:careers@foodbridge.app">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-black text-primary uppercase tracking-widest">Support</p>
            <ul className="space-y-3">
              <li><Link className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors" href="/faq">FAQ</Link></li>
              <li><Link className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors" href="mailto:hello@foodbridge.app">Contact</Link></li>
              <li><Link className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors" href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-black text-primary uppercase tracking-widest">Subscribe</p>
            <div className="flex gap-2">
              <input className="flex-1 bg-surface-container-low border-outline-variant rounded-full px-6 py-3 text-sm focus:ring-primary focus:border-primary shadow-inner" placeholder="Your email..." type="email" />
              <button className="px-8 py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-surface-tint shadow-lg transition-all">Join</button>
            </div>
            <p className="text-xs font-bold text-on-surface-variant italic">Stay updated on our local impact.</p>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-20 pt-10 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
 <p className="text-xs font-bold text-on-surface-variant">© {new Date().getFullYear()} Food Bridge. Let&apos;s make a difference together!</p>
          <div className="flex gap-8">
            <Link className="text-on-surface-variant hover:text-primary transition-transform hover:scale-125" href="#"><span className="material-symbols-outlined text-[24px]">public</span></Link>
            <Link className="text-on-surface-variant hover:text-primary transition-transform hover:scale-125" href="#"><span className="material-symbols-outlined text-[24px]">group</span></Link>
            <Link className="text-on-surface-variant hover:text-primary transition-transform hover:scale-125" href="#"><span className="material-symbols-outlined text-[24px]">mail</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
