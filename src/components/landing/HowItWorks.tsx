export function HowItWorks() {
    return (
        <section className="py-24 bg-background text-foreground overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-heading mb-4">How It Works</h2>
                    <p className="text-muted">Join the community in 3 simple steps.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-surface rounded-full border-4 border-background flex items-center justify-center text-2xl font-bold text-foreground mb-6 shadow-soft">
                                1
                            </div>
                            <h3 className="text-xl font-bold mb-3">Sign Up</h3>
                            <p className="text-muted text-sm max-w-xs">
                                Use your simple Gmail. We verify you're real without exposing your identity.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-surface rounded-full border-4 border-background flex items-center justify-center text-2xl font-bold text-foreground mb-6 shadow-soft">
                                2
                            </div>
                            <h3 className="text-xl font-bold mb-3">Choose Mode</h3>
                            <p className="text-muted text-sm max-w-xs">
                                Post publicly as yourself or switch to "Anonymous Mode" to wear the Tiger Mask.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary text-white rounded-full border-4 border-background flex items-center justify-center text-2xl font-bold mb-6 shadow-soft">
                                3
                            </div>
                            <h3 className="text-xl font-bold mb-3">Engage Freely</h3>
                            <p className="text-muted text-sm max-w-xs">
                                Vote on polls, comment on confessions, and download resources instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
