import { MessageCircle, BarChart3, Calendar, FileText, Search, MessageSquare } from 'lucide-react';

export function FeaturesSection() {
    const features = [
        {
            icon: <div className="text-3xl">🐯</div>,
            title: "Anonymous Confessions",
            desc: "Share secrets, crushes, or honest opinions behind a Tiger Mask alias."
        },
        {
            icon: <BarChart3 className="text-blue-500" size={32} />,
            title: "Campus Polls",
            desc: "Settle debates or gauge campus opinion on important topics instantly."
        },
        {
            icon: <Calendar className="text-red-500" size={32} />,
            title: "Events & Notices",
            desc: "Never miss a fest, exam schedule, or workshop again."
        },
        {
            icon: <FileText className="text-green-500" size={32} />,
            title: "Resource Sharing",
            desc: "Upload and find notes, previous years' papers, and syllabus copies."
        },
        {
            icon: <MessageSquare className="text-purple-500" size={32} />,
            title: "Open Discussions",
            desc: "Discuss hostel life, canteen food, or academic doubts openly."
        },
        {
            icon: <Search className="text-muted" size={32} />,
            title: "Fast Search",
            desc: "Find exactly what you're looking for purely by keywords."
        }
    ];

    return (
        <section className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold font-heading text-foreground mb-4">Everything You Need</h2>
                    <p className="text-muted">From entertainment to academics, SNJB Connect brings the entire campus to your screen.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {features.map((f, i) => (
                        <div key={i} className="flex gap-4 items-start group">
                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
