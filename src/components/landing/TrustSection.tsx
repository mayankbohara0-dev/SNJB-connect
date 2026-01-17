import { Shield, Lock, School } from 'lucide-react';

export function TrustSection() {
    return (
        <section className="py-20 bg-background border-y border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-surface p-8 rounded-2xl shadow-soft border border-border flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-6 text-primary">
                            <Lock size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">Anonymous by Default</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            Your identity is encrypted and never shown to other students. Speak freely without fear.
                        </p>
                    </div>

                    <div className="bg-surface p-8 rounded-2xl shadow-soft border border-border flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-6 text-primary">
                            <School size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">College-Only Access</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            Exclusive to verified students. Outsiders cannot join or view our community conversations.
                        </p>
                    </div>

                    <div className="bg-surface p-8 rounded-2xl shadow-soft border border-border flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-6 text-primary">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-foreground">Moderated Safety</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            A safe space. Abuse, hate speech, and threats are automatically flagged and handled responsibly.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
