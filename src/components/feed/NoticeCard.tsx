import { Card } from '@/components/ui/Card';
import { AlertTriangle, Calendar, Info } from 'lucide-react';

interface NoticeCardProps {
    type: 'urgent' | 'event' | 'info';
    title: string;
    description: string;
    date: string;
}

export function NoticeCard({ type, title, description, date }: NoticeCardProps) {
    const styles = {
        urgent: 'bg-gradient-to-br from-red-50 to-red-100 text-red-900 border-red-200',
        event: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border-blue-200',
        info: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-900 border-yellow-200',
    };

    const icons = {
        urgent: AlertTriangle,
        event: Calendar,
        info: Info,
    };

    const Icon = icons[type];

    return (
        <Card className={`flex-shrink-0 w-72 p-4 mr-4 mb-2 border ${styles[type]} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm`}>
                    <Icon size={18} className="opacity-80" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">{type}</span>
            </div>
            <h3 className="font-bold text-lg leading-tight mb-2">{title}</h3>
            <p className="text-sm opacity-80 line-clamp-2 mb-3">{description}</p>
            <p className="text-xs font-medium opacity-60">{date}</p>
        </Card>
    );
}
