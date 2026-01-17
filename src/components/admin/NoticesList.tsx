'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, AlertCircle, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Notice {
    id: string;
    title: string;
    content: string;
    type: string;
    date: string;
    created_at: string;
}

interface NoticesListProps {
    initialNotices: Notice[];
}

export function NoticesList({ initialNotices }: NoticesListProps) {
    const [notices, setNotices] = useState<Notice[]>(initialNotices);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notice? This action cannot be undone.')) {
            return;
        }

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('notices')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNotices(prev => prev.filter(n => n.id !== id));
        } catch (err: any) {
            console.error('Error deleting notice:', err);
            alert('Failed to delete notice: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (notices.length === 0) {
        return null;
    }

    return (
        <Card className="p-6 bg-surface border border-border mt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="text-primary" />
                Manage Notices & Events
            </h3>

            <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-hover/50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="py-3 px-4">Title</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-surface-hover/30 transition-colors">
                                <td className="py-3 px-4 font-medium">{notice.title}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize
                                        ${notice.type === 'event' ? 'bg-purple-500/10 text-purple-500' :
                                            notice.type === 'exam' ? 'bg-red-500/10 text-red-500' :
                                                notice.type === 'holiday' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-blue-500/10 text-blue-500'}`}>
                                        {notice.type}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-400">{notice.date}</td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => handleDelete(notice.id)}
                                        disabled={deletingId === notice.id}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Delete Notice"
                                    >
                                        {deletingId === notice.id ? (
                                            <span className="w-4 h-4 block border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
