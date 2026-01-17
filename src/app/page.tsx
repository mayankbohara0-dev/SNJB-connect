

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Shield, Users, Zap, LayoutGrid, MessageCircle, ShoppingBag, Search, FileText, MessageSquare } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 60; // Revalidate every minute

export default async function LandingPage() {
  // Fetch Real Stats (Cached for 60s)
  const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: confessionCount } = await supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }).eq('category', 'Confession');
  const { count: resourceCount } = await supabaseAdmin.from('notes').select('*', { count: 'exact', head: true });

  const stats = {
    users: userCount || 0,
    confessions: confessionCount || 0,
    resources: resourceCount || 0
  };
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold font-heading text-primary tracking-tight">SNJB Connect</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <Link href="/feed" className="flex items-center gap-2 text-primary hover:text-primary transition-colors bg-blue-50 px-4 py-2 rounded-full">
              <LayoutGrid size={16} /> Feed
            </Link>
            <Link href="/resources" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <FileText size={16} /> Resources
            </Link>
          </div>

          {/* CTA */}
          <div>
            <Link href="/login">
              <button className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-hover hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 relative overflow-hidden">

        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse" />

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50">
          <Zap size={12} className="text-primary fill-primary" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">
            Next Gen Campus Network
          </span>
        </div>

        {/* Big Heading */}
        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tight leading-none mb-6">
          <span className="block text-foreground mb-[-0.1em]">SNJB</span>
          <span className="block text-primary">CONNECT</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg md:text-xl text-muted leading-relaxed mb-10">
          The digital heartbeat of SNJB. A private, student-powered ecosystem designed for authentic expression.
        </p>

        {/* CTA Button */}
        <Link href="/login">
          <button className="group relative px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden">
            <span className="relative z-10">Join The Tribe</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </Link>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32 text-left">

          {/* Feature 1 */}
          <div className="p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group border border-transparent hover:border-blue-50">
            <div className="w-12 h-12 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Radical Anonymity</h3>
            <p className="text-muted text-sm leading-relaxed">
              Say what's on your mind without the weight of your name. Confess safely.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group border border-transparent hover:border-blue-50">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Student-First</h3>
            <p className="text-muted text-sm leading-relaxed">
              Built by students. No admin filters, just pure campus culture and vibes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group border border-transparent hover:border-blue-50">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutGrid size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">All-In-One</h3>
            <p className="text-muted text-sm leading-relaxed">
              Confessions, resources, and notices in one single place.
            </p>
          </div>

        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-20">
          <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 text-center">
            <div className="text-3xl font-black text-blue-600 mb-1">{stats.users}+</div>
            <div className="text-sm text-blue-600/60 font-medium uppercase tracking-wide">Beta Users</div>
          </div>
          <div className="p-6 rounded-3xl bg-pink-50/50 border border-pink-100 text-center">
            <div className="text-3xl font-black text-pink-600 mb-1">{stats.confessions}+</div>
            <div className="text-sm text-pink-600/60 font-medium uppercase tracking-wide">Confessions</div>
          </div>
          <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 text-center">
            <div className="text-3xl font-black text-purple-600 mb-1">{stats.resources}+</div>
            <div className="text-sm text-purple-600/60 font-medium uppercase tracking-wide">Resources</div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6 tracking-tight">
            Don't Miss Out. <br />
            <span className="text-primary">Join the Inner Circle.</span>
          </h2>
          <Link href="/login" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20 gap-2">
            Get Started Now <ArrowRight size={20} />
          </Link>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-muted text-sm border-t border-border/40">
        <p>© 2024 SNJB Connect. Made with 💙 by Students.</p>
      </footer>

    </div>
  );
}
