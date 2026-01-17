'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PenSquare, AlertTriangle, BarChart2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePostProps {
    onPostCreated: () => void;
    userId: string;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, userId }) => {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<'Discussion' | 'Confession' | 'Help' | 'Rant' | 'Poll'>('Discussion');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            // Determine DB Type
            let dbType = 'text';
            if (category === 'Confession') dbType = 'confession';
            if (category === 'Poll') dbType = 'poll';

            // Determine DB Tags
            // We always add the category as a tag (e.g. "Help", "Rant", "Discussion")
            const tags = [category];

            // 1. Create Post
            const { data: post, error } = await supabase.from('posts').insert({
                content,
                user_id: userId,
                type: dbType,
                tags: tags,
            }).select().single();

            if (error) throw error;

            // 2. Create Poll Options if applicable
            if (category === 'Poll' && post) {
                const validOptions = pollOptions.filter(o => o.trim() !== '');
                if (validOptions.length < 2) throw new Error("Poll needs at least 2 options");

                const optionsPayload = validOptions.map(label => ({
                    post_id: post.id,
                    label,
                    vote_count: 0
                }));

                const { error: optError } = await supabase.from('poll_options').insert(optionsPayload);
                if (optError) throw optError;
            }

            setContent('');
            setCategory('Discussion');
            setPollOptions(['', '']);
            setIsAnonymous(false);
            setIsOpen(false);
            onPostCreated();
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to post: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addOption = () => {
        if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
    };

    if (!isOpen) {
        return (
            <Card
                onClick={() => setIsOpen(true)}
                className="mb-8 cursor-pointer hover:bg-surface-hover flex items-center gap-4 group transition-all"
                hoverEffect
            >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <PenSquare size={20} />
                </div>
                <div>
                    <span className="text-muted font-medium block">What's on your mind?</span>
                    <span className="text-xs text-muted/60">Share anonymously with campus</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mb-8 animate-fade-in-up border border-border shadow-soft bg-surface">
            <form onSubmit={handleSubmit}>
                {/* Category Pills */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide p-1">
                    {[
                        { id: 'Discussion', label: 'Discussion', color: 'bg-info', text: 'text-info', border: 'border-info' },
                        { id: 'Confession', label: 'Confession', color: 'bg-warning', text: 'text-warning', border: 'border-warning' },
                        { id: 'Help', label: 'Help', color: 'bg-success', text: 'text-success', border: 'border-success' },
                        { id: 'Rant', label: 'Rant', color: 'bg-danger', text: 'text-danger', border: 'border-danger' },
                        { id: 'Poll', label: 'Poll', color: 'bg-teal', text: 'text-teal', border: 'border-teal' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCategory(tab.id as any)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border
                                ${category === tab.id
                                    ? `${tab.color} text-white border-transparent shadow-md`
                                    : `bg-white text-muted border-border hover:bg-surface-hover hover:border-gray-300`
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={category === 'Poll' ? "Ask a poll question..." : category === 'Confession' ? "Confess anonymously..." : "Share what's on your mind..."}
                        className="w-full bg-surface-hover rounded-xl p-4 resize-none outline-none text-foreground placeholder:text-muted/60 text-lg min-h-[140px] mb-4 border-none focus:ring-1 focus:ring-primary/20"
                        autoFocus
                    />
                </div>

                {category === 'Poll' && (
                    <div className="space-y-3 mb-6 animate-fade-in-up">
                        {pollOptions.map((opt, idx) => (
                            <Input
                                key={idx}
                                value={opt}
                                onChange={(e) => updateOption(idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                            />
                        ))}
                        {pollOptions.length < 4 && (
                            <button type="button" onClick={addOption} className="text-sm text-teal hover:text-teal/80 font-medium flex items-center gap-1 pl-1">
                                <Plus size={16} /> Add Option
                            </button>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                        {/* Anonymous Toggle */}
                        <div
                            className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100"
                            onClick={() => setIsAnonymous(!isAnonymous)}
                        >
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isAnonymous || category === 'Confession' ? 'bg-primary' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isAnonymous || category === 'Confession' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-xs font-semibold text-muted">
                                {isAnonymous || category === 'Confession' ? 'Anonymous' : 'Public'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-muted hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !content.trim()}
                            isLoading={loading}
                            className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 shadow-lg shadow-primary/20"
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
};
