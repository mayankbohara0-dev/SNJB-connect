'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Calendar, Send, Loader2 } from 'lucide-react';

export function CreateNotice() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('info');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notices')
                .insert({
                    title,
                    content,
                    type,
                    date: date || new Date().toISOString().split('T')[0],
                    created_by: user.id
                });

            if (error) throw error;

            alert('Notice posted successfully!');
            setTitle('');
            setContent('');
            setDate('');
        } catch (err: any) {
            console.error(err);
            alert('Failed to post notice: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-surface border border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-primary" />
                Post New Notice
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 rounded-lg bg-surface-hover border border-border focus:border-primary outline-none text-sm"
                        placeholder="e.g. Mid-Sem Exams"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2 rounded-lg bg-surface-hover border border-border focus:border-primary outline-none text-sm"
                        >
                            <option value="info">Info</option>
                            <option value="event">Event</option>
                            <option value="exam">Exam</option>
                            <option value="holiday">Holiday</option>
                            <option value="broadcast">📢 Broadcast (Pin to Top)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 rounded-lg bg-surface-hover border border-border focus:border-primary outline-none text-sm min-h-[80px]"
                        placeholder="Details..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Post Notice
                </button>
            </form>
        </Card>
    );
}
