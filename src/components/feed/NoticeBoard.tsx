'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Info, Clock } from 'lucide-react';

export function NoticeBoard() {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotices() {
            const { data } = await supabase
                .from('notices')
                .select('*')
                .order('date', { ascending: true }) // Upcoming first
                .gte('date', new Date().toISOString().split('T')[0]) // Only future/today
                .limit(10); // Fetch more to handle broadcasts

            const sorted = (data || []).sort((a, b) => {
                if (a.type === 'broadcast' && b.type !== 'broadcast') return -1;
                if (a.type !== 'broadcast' && b.type === 'broadcast') return 1;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });

            setNotices(sorted);
            setLoading(false);
        }
        fetchNotices();
    }, []);

    if (loading) return <div className="h-40 animate-pulse bg-gray-50 rounded-xl" />;

    return (
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" />
                Upcoming Events
            </h3>
            <div className="space-y-4">
                {notices.map((notice) => {
                    const isBroadcast = notice.type === 'broadcast';
                    return (
                        <div key={notice.id} className={`relative pl-4 border-l-2 transition-colors py-1 group
                            ${isBroadcast ? 'border-red-500 bg-red-50/50 rounded-r-lg p-2 mb-2' : 'border-primary/20 hover:border-primary'}
                        `}>
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                    {isBroadcast && <span>📢</span>}
                                    {notice.title}
                                </h4>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isBroadcast ? 'bg-red-500 text-white animate-pulse' :
                                        notice.type === 'exam' ? 'bg-red-100 text-red-700' :
                                            notice.type === 'holiday' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                    }`}>
                                    {isBroadcast ? 'ALERT' : notice.type}
                                </span>
                            </div>
                            <p className="text-xs text-muted mt-1 line-clamp-2">
                                {notice.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Clock size={10} className="text-muted" />
                                <span className="text-[10px] text-muted font-medium">
                                    {new Date(notice.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {notices.length === 0 && (
                    <div className="text-center py-8">
                        <Info size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-muted">No upcoming events</p>
                    </div>
                )}
            </div>
        </div>
    );
}
