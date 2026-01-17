'use client';

import React, { useState } from 'react';
import { voteOnPoll } from '@/app/actions/polls';
import { deletePost } from '@/app/actions/feed';
import { reportPost } from '@/app/actions/reports';
import { toggleLike } from '@/app/actions/likes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, Flag, X, MessageCircle } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import { Comments } from './Comments';
import { toast } from 'sonner';

interface PollOption {
    id: string;
    label: string;
    vote_count: number;
}

interface PostProps {
    id: string; // Needed for voting
    userId: string; // Author's user ID
    content: string;
    type: 'text' | 'image' | 'confession' | 'poll';
    authorAlias: string;
    createdAt: string;
    imageUrl?: string | null;
    pollOptions?: PollOption[];
    userVotedOptionId?: string | null;
    isAdmin?: boolean;
    initialLiked?: boolean;
    initialLikesCount?: number;
    tags?: string[] | null;
    currentUserId?: string;
}

export const PostCard: React.FC<PostProps> = ({
    id, userId, content, type, authorAlias, createdAt, tags, imageUrl, pollOptions, isAdmin,
    initialLiked = false, initialLikesCount = 0, currentUserId
}) => {
    const isConfession = type === 'confession';
    const isPoll = type === 'poll';
    const [voting, setVoting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reporting, setReporting] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Real Likes State
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikesCount);
    const [liking, setLiking] = useState(false);

    const handleVote = async (optionId: string) => {
        setVoting(true);
        const res = await voteOnPoll(id, optionId);
        if (!res.success) {
            toast.error(res.error);
        }
        setVoting(false);
    };

    const handleDelete = async () => {
        if (!confirm('ADMIN: Are you sure you want to delete this post?')) return;
        setDeleting(true);
        const res = await deletePost(id);
        if (!res.success) toast.error(res.error);
        else toast.success('Post deleted successfully');
        setDeleting(false);
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            toast.error('Please provide a reason for reporting');
            return;
        }

        setReporting(true);
        const res = await reportPost(id, userId, reportReason);
        if (res.success) {
            toast.success('Report submitted successfully. Admin will review it.');
            setShowReportModal(false);
            setReportReason('');
        } else {
            toast.error(res.error || 'Failed to submit report');
        }
        setReporting(false);
    };

    const handleLike = async () => {
        if (liking) return;

        // Optimistic UI update
        const previousLiked = liked;
        const previousCount = likeCount;

        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        setLiking(true);

        const res = await toggleLike(id);

        if (!res.success) {
            // Revert if failed
            setLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error(res.error || "Failed to like post");
        }
        setLiking(false);
    };

    const totalVotes = pollOptions?.reduce((acc, curr) => acc + curr.vote_count, 0) || 0;

    // Design Adaptation: Color coding based on type
    let badgeColor = "bg-gray-800 text-gray-300"; // Default Dark
    let typeLabel = "Post";

    if (type === 'poll') {
        badgeColor = "bg-teal/10 text-teal";
        typeLabel = "Poll";
    } else if (type === 'confession') {
        badgeColor = "bg-warning/10 text-warning";
        typeLabel = "Confession";
    } else if (tags?.includes('help')) {
        badgeColor = "bg-success/10 text-success";
        typeLabel = "Help";
    } else if (tags?.includes('rant')) {
        badgeColor = "bg-danger/10 text-danger";
        typeLabel = "Rant";
    } else {
        badgeColor = "bg-primary/10 text-primary";
        typeLabel = "Discussion";
    }

    const avatarUrl = isConfession ? getAvatarUrl('anonymous-tiger') : getAvatarUrl(userId);

    return (
        <Card
            className={`mb-6 p-5 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 relative group animate-fade-in-up border border-border bg-surface`}
            hoverEffect={false}
        >
            {/* Admin Delete Button */}
            {isAdmin && (
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="absolute top-5 right-5 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-background rounded-full"
                    title="Delete Post (Admin)"
                >
                    <Trash2 size={16} />
                </button>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">

                    {/* Anonymous Avatar Logic */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm border border-black/5 overflow-hidden bg-white`}>
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground font-heading">
                            {isConfession ? 'Anonymous Tiger' : authorAlias}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {typeLabel}
                            </span>
                            <span className="text-[10px] text-muted font-medium">
                                • {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <p className={`text-[15px] leading-relaxed whitespace-pre-wrap mb-4 font-normal ${isConfession ? 'text-gray-800' : 'text-foreground'}`}>
                {content}
            </p>

            {imageUrl && type === 'image' && (
                <div className="mb-4 rounded-xl overflow-hidden border border-border/50 shadow-sm relative group/image cursor-pointer">
                    <img src={imageUrl} alt="Post attachment" className="w-full h-auto object-cover max-h-96 transition-transform group-hover/image:scale-105" />
                </div>
            )}

            {isPoll && pollOptions && (
                <div className="space-y-2 mt-4">
                    {pollOptions.map((option) => {
                        const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                        const isWinner = percentage >= 50 && totalVotes > 5;
                        return (
                            <button
                                key={option.id}
                                onClick={() => handleVote(option.id)}
                                disabled={voting}
                                className={`relative w-full text-left p-3 rounded-xl transition-all overflow-hidden border 
                                    ${isWinner ? 'bg-teal/5 border-teal/20' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm'}
                                `}
                            >
                                {/* Progress Bar */}
                                <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out opacity-10
                                        ${isWinner ? 'bg-teal' : 'bg-gray-400'}
                                    `}
                                    style={{ width: `${percentage}%` }}
                                />

                                <div className="relative flex justify-between items-center z-10 w-full pl-1">
                                    <span className="font-medium text-sm text-foreground">{option.label}</span>
                                    <span className="text-xs font-bold text-muted bg-white/50 px-2 py-1 rounded-md">{percentage}%</span>
                                </div>
                            </button>
                        );
                    })}
                    <div className="text-xs text-right text-muted font-medium mt-1 pr-1">{totalVotes} votes</div>
                </div>
            )}

            {/* Interactions */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-dashed border-gray-100 text-gray-400">
                <button
                    onClick={handleLike}
                    disabled={liking}
                    className={`flex items-center gap-1.5 transition-colors group/like ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                    <span className={`transform transition-transform ${liked ? 'scale-110' : 'group-hover/like:scale-110'}`}>
                        {liked ? '❤️' : '♡'}
                    </span>
                    <span className="text-xs font-bold">{likeCount}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                >
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">Comment</span>
                </button>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                >
                    <Flag size={14} />
                    <span className="text-xs font-bold">Report</span>
                </button>
                <button className="ml-auto hover:text-foreground transition-colors p-2 hover:bg-gray-50 rounded-full">
                    <span>🔖</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && currentUserId && (
                <Comments
                    postId={id}
                    currentUserId={currentUserId}
                    postType={type}
                    postAuthorId={userId}
                />
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <Card className="w-full max-w-md bg-surface p-6 rounded-3xl shadow-2xl relative border border-border">
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 text-muted hover:text-foreground bg-background rounded-full p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Flag size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground text-center">Report Post</h2>
                            <p className="text-sm text-muted text-center mt-2">Help us keep the community safe</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for reporting</label>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="Please describe why you're reporting this post..."
                                    className="w-full bg-surface-hover rounded-xl p-4 min-h-[120px] border-2 border-border focus:border-primary focus:ring-0 resize-none text-foreground placeholder:text-muted/60 outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowReportModal(false)}
                                    variant="ghost"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReport}
                                    disabled={!reportReason.trim() || reporting}
                                    isLoading={reporting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Submit Report
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </Card>
    );
};
