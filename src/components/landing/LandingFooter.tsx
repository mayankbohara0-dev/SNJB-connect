import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="bg-background py-12 border-t border-border">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h4 className="font-bold text-foreground text-lg">SNJB Connect</h4>
                    <p className="text-muted text-sm mt-1">© 2026 Student Platform. Built for students.</p>
                </div>

                <div className="flex gap-8 text-sm font-medium text-muted">
                    <Link href="#" className="hover:text-foreground">Privacy</Link>
                    <Link href="#" className="hover:text-foreground">Terms</Link>
                    <Link href="#" className="hover:text-foreground">Contact</Link>
                </div>
            </div>
        </footer>
    );
}
