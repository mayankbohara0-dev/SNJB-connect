'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Smile } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    loading: () => <div className="p-4 text-center text-xs">Loading Emojis...</div>,
    ssr: false // Client-side only
});

export function Comments({ postId, currentUserId, postType, postAuthorId }: {
    postId: string,
    currentUserId: string,
    postType?: string,
    postAuthorId?: string
}) {
    const [comments, setComments] = useState<any[]>([]); // Tree structure
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = (emojiObject: any) => {
        setNewComment(prev => prev + emojiObject.emoji);
        // Don't close picker automatically to allow multiple emojis
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles:user_id (
                        alias,
                        username
                    )
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(buildTree(data || []));
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (flatComments: any[]) => {
        const map: Record<string, any> = {};
        const roots: any[] = [];

        // First pass: Init map items
        flatComments.forEach(c => {
            map[c.id] = { ...c, children: [] };
        });

        // Second pass: Connect parents
        flatComments.forEach(c => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].children.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        return roots;
    };

    // Generalized submit handler for both top-level and replies
    const handleAddComment = async (parentId: string | null, content: string) => {
        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    post_id: postId,
                    user_id: currentUserId,
                    content: content.trim(),
                    parent_id: parentId // null for top-level
                });

            if (error) throw error;
            fetchComments(); // Refresh tree
        } catch (err) {
            console.error('Error posting comment:', err);
            toast.error('Failed to post comment');
        }
    };

    const handleTopLevelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        await handleAddComment(null, newComment);
        setNewComment('');
        setSubmitting(false);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            fetchComments();
            toast.success('Comment deleted');
        } catch (err) {
            console.error('Error deleting comment:', err);
            toast.error('Failed to delete comment');
        }
    };

    if (loading) return <div className="p-4 text-center text-xs text-muted">Loading comments...</div>;

    return (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
            <div className="space-y-6 mb-6">
                {comments.length === 0 ? (
                    <div className="text-center text-xs text-muted italic py-4">Be the first to comment!</div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            postType={postType}
                            postAuthorId={postAuthorId}
                            onDelete={handleDelete}
                            onReply={(parentId, content) => handleAddComment(parentId, content)}
                        />
                    ))
                )}
            </div>

            {/* Top Level Input */}
            <div className="relative z-10">
                <form onSubmit={handleTopLevelSubmit} className="flex gap-2 items-end bg-surface border border-gray-200 rounded-3xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-muted hover:text-yellow-500 transition-colors rounded-full hover:bg-yellow-50"
                    >
                        <Smile size={20} />
                    </button>

                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment... (supports **bold**, *italic*)"
                        className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-2 text-sm placeholder:text-muted min-h-[40px]"
                        disabled={submitting}
                    />

                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="p-2 bg-primary text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 mb-1 mr-1"
                    >
                        <Send size={16} />
                    </button>
                </form>

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div className="absolute bottom-16 left-0 z-50 animate-fade-in-up">
                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} /> {/* Backdrop */}
                        <div className="relative z-50 shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                width={300}
                                height={400}
                                previewConfig={{ showPreview: false }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
