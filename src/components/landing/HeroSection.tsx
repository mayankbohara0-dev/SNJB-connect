'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Lazy load the 3D component to keep initial bundle size small (Performance Rule)
const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

export function HeroSection() {
    return (
        <section className="relative h-screen min-h-[600px] flex flex-col items-center justify-center text-center overflow-hidden bg-background text-foreground px-6">

            {/* 3D Background */}
            <Hero3D />

            {/* Content Overlay */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">

                {/* Logo */}
                <div className="mb-6">
                    <img
                        src="/logo.png"
                        alt="SNJB Connect"
                        className="h-40 md:h-52 lg:h-64 mx-auto filter drop-shadow-[0_0_30px_rgba(91,127,229,0.3)]"
                    />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/50 border border-border backdrop-blur-sm text-xs font-medium text-primary mb-4">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Live on Campus
                </div>

                <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight leading-tight">
                    A Safe Anonymous Space <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B7FE5] to-[#F4C542]">
                        For Students
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                    Share confessions, opinions, notes & events — without revealing who you are.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <Link
                        href="/register"
                        className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-hover transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-primary/25"
                    >
                        Sign Up Now <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-4 bg-transparent border border-border text-foreground rounded-full font-bold text-lg hover:bg-surface transition-colors"
                    >
                        Already a Member? Login
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-foreground/50 rounded-full flex justify-center p-1">
                    <div className="w-1 h-2 bg-foreground/50 rounded-full animate-pulse"></div>
                </div>
            </div>
        </section>
    );
}
