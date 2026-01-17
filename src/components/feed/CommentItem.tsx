import { useState } from 'react';
import { getAvatarUrl } from '@/lib/utils';
import { Trash2, MessageCircle, CornerDownRight, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

interface CommentItemProps {
    comment: any;
    currentUserId: string;
    postType?: string;
    postAuthorId?: string;
    onDelete: (id: string) => void;
    onReply: (parentId: string, content: string) => Promise<void>;
}

export function CommentItem({ comment, currentUserId, postType, postAuthorId, onDelete, onReply }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    let authorName = comment.profiles?.alias || comment.profiles?.username || 'Unknown';
    let avatarUrl = getAvatarUrl(comment.user_id);

    // OP Anonymity Logic
    const isOP = comment.user_id === postAuthorId;
    if (postType === 'confession' && isOP) {
        authorName = 'Anonymous Tiger (OP)';
        avatarUrl = getAvatarUrl('anonymous-tiger');
    }

    const isOwn = comment.user_id === currentUserId;

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        await onReply(comment.id, replyContent);
        setSubmitting(false);
        setReplyContent('');
        setIsReplying(false);
    };

    return (
        <div className="flex flex-col gap-2 animate-fade-in">
            <div className="flex gap-3 text-sm group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border">
                    <img src={avatarUrl} alt="Av" className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-surface-hover p-3 rounded-2xl rounded-tl-none inline-block min-w-[200px]">
                        <div className="flex justify-between items-start mb-1 gap-4">
                            <span className="font-bold text-xs text-primary">{authorName}</span>
                            <span className="text-[10px] text-muted">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-foreground/90 leading-relaxed font-normal text-sm prose prose-sm max-w-none prose-p:my-1 prose-a:text-primary prose-strong:text-primary">
                            <ReactMarkdown>{comment.content}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-[11px] font-bold text-muted hover:text-primary transition-colors flex items-center gap-1"
                        >
                            Reply
                        </button>

                        {isOwn && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-[11px] font-bold text-muted hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <form onSubmit={handleReplySubmit} className="flex gap-2 items-center mt-2 ml-2 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="text-muted"><CornerDownRight size={16} /></div>
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Replying to ${authorName}...`}
                                className="flex-1 bg-surface border border-border rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted"
                                disabled={submitting}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || submitting}
                                className="p-1.5 bg-primary text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all"
                            >
                                <Send size={12} />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Nested Comments (Children) */}
            {comment.children && comment.children.length > 0 && (
                <div className="ml-8 border-l-2 border-border/50 pl-4 space-y-4 pt-2">
                    {comment.children.map((child: any) => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            currentUserId={currentUserId}
                            postType={postType}
                            postAuthorId={postAuthorId}
                            onDelete={onDelete}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
