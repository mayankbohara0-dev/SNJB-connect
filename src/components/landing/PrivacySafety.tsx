import { ArrowRight } from 'lucide-react';

export function PrivacySafety() {
    return (
        <section className="py-24 bg-background border-b border-border">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                    Safety First
                </span>
                <h2 className="text-3xl font-bold font-heading text-foreground mb-6">
                    Privacy isn't a feature. It's our foundation.
                </h2>
                <div className="space-y-4 text-muted text-lg leading-relaxed mb-10">
                    <p>
                        SNJB Connect is designed to let you express yourself without the social pressure of identity.
                        Your email is encrypted and visible <strong>only to you</strong>.
                    </p>
                    <p>
                        We have zero tolerance for bullying. Our admin tools optimize for safety while respecting
                        the sanctity of anonymous speech.
                    </p>
                </div>

                <a href="#" className="inline-flex items-center text-sm font-bold text-foreground hover:text-blue-500 transition-colors">
                    Read our Full Privacy Policy <ArrowRight size={16} className="ml-2" />
                </a>
            </div>
        </section>
    );
}
