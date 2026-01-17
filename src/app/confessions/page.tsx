'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Ghost, Send, ArrowLeft } from 'lucide-react';

export default function ConfessionsPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('Please login to post a confession');
                router.push('/login');
                return;
            }

            // Check if user is approved
            const { data: profile } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', user.id)
                .single();

            if (profile?.status !== 'approved') {
                alert('Your account is pending approval. Please wait for admin approval.');
                router.push('/approval-pending');
                return;
            }

            // Insert the confession
            const { error } = await supabase.from('posts').insert({
                content,
                user_id: user.id,
                type: 'confession',
                tags: ['confession']
            });

            if (error) {
                console.error('Error posting confession:', error);
                alert('Error posting confession: ' + error.message);
            } else {
                router.push('/feed'); // Redirect to feed to see it
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF6F8] p-6 pb-32">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" className="p-2" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-heading text-pink-900">Confessions</h1>
                    <p className="text-pink-700/60 text-sm">Speak your heart out, safely.</p>
                </div>
            </header>

            <div className="max-w-md mx-auto">
                <Card className="bg-white/80 backdrop-blur border-pink-100 shadow-xl shadow-pink-100/50 p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Ghost size={120} className="text-pink-500" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-pink-900 mb-2 uppercase tracking-wider">
                                Your Secret
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="I have a crush on..."
                                className="w-full bg-pink-50/50 rounded-xl p-4 min-h-[200px] border-2 border-pink-100 focus:border-pink-300 focus:ring-0 resize-none text-lg text-pink-900 placeholder:text-pink-300/80 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-pink-400 text-xs font-medium bg-pink-50 px-3 py-1 rounded-full">
                                <Ghost size={14} />
                                <span>Posting as Anonymous Tiger</span>
                            </div>
                            <Button
                                type="submit"
                                disabled={!content.trim() || loading}
                                isLoading={loading}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-8 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transform hover:-translate-y-1 transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    Confess <Send size={16} />
                                </span>
                            </Button>
                        </div>
                    </form>
                </Card>

                <div className="text-center text-pink-900/40 text-xs px-8 leading-relaxed">
                    <p>Your identity is hidden even from admins. Be kind, be respectful. <br />Hate speech is not tolerated.</p>
                </div>
            </div>
        </div>
    );
}
