import Link from 'next/link';

export function FinalCTA() {
    return (
        <section className="py-32 bg-surface text-center px-6">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6 tracking-tight">
                Your Campus. Your Voice. <br /> <span className="text-muted">No Fear.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                <Link
                    href="/login"
                    className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-hover transition-all hover:scale-105 shadow-xl shadow-primary/20"
                >
                    Create Free Account
                </Link>
                <Link
                    href="/login"
                    className="px-8 py-4 bg-transparent text-foreground border border-border rounded-full font-bold text-lg hover:bg-white/5 transition-all"
                >
                    Already a Member? Log In
                </Link>
            </div>
        </section>
    );
}
