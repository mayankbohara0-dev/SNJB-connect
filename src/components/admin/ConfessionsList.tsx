'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, MessageCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Post {
    id: string;
    content: string;
    type: string;
    created_at: string;
    user_id: string;
    authorAlias?: string;
}

interface ConfessionsListProps {
    initialPosts: Post[];
}

export function ConfessionsList({ initialPosts }: ConfessionsListProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
            return;
        }

        setDeletingId(id);
        try {
            // Use server action logic or client-side supabase if policies allow
            // Since this is admin page, client-side RLS should allow if user is admin
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (posts.length === 0) {
        return (
            <Card className="p-6 bg-surface border border-border mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="text-pink-500" />
                    Manage Confessions & Posts
                </h3>
                <p className="text-gray-400 text-sm">No confessions or posts found.</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-surface border border-border mt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="text-pink-500" />
                Manage Confessions & Posts
            </h3>

            <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-hover/50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="py-3 px-4">Content</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-surface-hover/30 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="max-w-md truncate font-medium" title={post.content}>
                                        {post.content}
                                    </div>
                                    {post.type === 'confession' && (
                                        <div className="text-xs text-pink-400 mt-1">Anonymous Tiger ({post.user_id.slice(0, 6)}...)</div>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize
                                        ${post.type === 'confession' ? 'bg-pink-500/10 text-pink-500' :
                                            post.type === 'poll' ? 'bg-teal/10 text-teal-500' :
                                                'bg-blue-500/10 text-blue-500'}`}>
                                        {post.type}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-400">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        disabled={deletingId === post.id}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Delete Post"
                                    >
                                        {deletingId === post.id ? (
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
