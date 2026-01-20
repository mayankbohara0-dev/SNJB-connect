'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePost } from '@/components/feed/CreatePost';
import { NoticeCard } from '@/components/feed/NoticeCard';
import { Filter, TrendingUp, Calendar, Info, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAvatarUrl } from '@/lib/utils';
import { NoticeBoard } from '@/components/feed/NoticeBoard';
import { KarmaLeaderboard } from '@/components/feed/KarmaLeaderboard';
import { TopNavbar } from '@/components/layout/TopNavbar';

export default function FeedPage() {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const POSTS_PER_PAGE = 5;

    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    const categories = ['All', 'Discussion', 'Confession', 'Help', 'Poll', 'Rant'];

    useEffect(() => {
        if (debouncedSearch !== searchTerm) {
            const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]); // Only deps on searchTerm change, logic handled in effect below

    // dedicated effect for search/filter changes -> reset properties
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setPosts([]);
        if (userId) fetchPosts(userId, 1, true);
    }, [debouncedSearch, filter, userId]);


    async function init() {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            router.push('/login');
            return;
        }
        const uid = data.user.id;
        setUserId(uid);
        const { data: profile } = await (supabase.from('profiles') as any).select('role').eq('id', uid).single();
        if (profile?.role === 'admin') setIsAdmin(true);

        // Fetch first page handled by the effect above interacting with userId set
        // But for safety on first load wait for userId
    }

    // Effect to run init once
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const fetchPosts = async (currentUserId: string, pageNum: number, isReset: boolean = false) => {
        setLoading(true);
        const from = (pageNum - 1) * POSTS_PER_PAGE;
        const to = from + POSTS_PER_PAGE - 1;

        let query = (supabase.from('public_posts') as any)
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (debouncedSearch) {
            query = query.ilike('content', `%${debouncedSearch}%`);
        } else if (filter !== 'All') {
            const f = filter.toLowerCase();
            if (f === 'discussion') {
                query = query.eq('type', 'text');
            } else if (f === 'poll') {
                query = query.eq('type', 'poll');
            } else {
                query = query.or(`type.eq.${f},tags.cs.{${filter}}`);
            }
        }

        const { data: postsData, error, count } = await query;

        if (error) {
            setLoading(false);
            return;
        }

        if (!postsData) {
            setLoading(false);
            return;
        }

        // Check if we hit the end
        if (count !== null && from + postsData.length >= count) {
            setHasMore(false);
        }

        // --- Fetch Metadata (Polls, Likes) ---
        const pollPostIds = postsData.filter((p: any) => p.type === 'poll').map((p: any) => p.id);
        let optionsMap: Record<string, any[]> = {};

        if (pollPostIds.length > 0) {
            const { data: options } = await (supabase
                .from('poll_options') as any)
                .select('*')
                .in('post_id', pollPostIds);

            if (options) {
                options.forEach((opt: any) => {
                    if (!optionsMap[opt.post_id]) optionsMap[opt.post_id] = [];
                    optionsMap[opt.post_id].push(opt);
                });
            }
        }

        let likedPostIds = new Set();
        if (currentUserId) {
            const { data: userLikes } = await (supabase
                .from('post_likes') as any)
                .select('post_id')
                .eq('user_id', currentUserId);

            if (userLikes) {
                likedPostIds = new Set(userLikes.map((l: any) => l.post_id));
            }
        }

        const mergedPosts = postsData.map((post: any) => ({
            ...post,
            pollOptions: optionsMap[post.id] ? optionsMap[post.id].sort((a: any, b: any) => a.label.localeCompare(b.label)) : undefined,
            isLiked: likedPostIds.has(post.id)
        }));

        setPosts((prev: any[]) => isReset ? mergedPosts : [...prev, ...mergedPosts]);
        setLoading(false);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        if (userId) fetchPosts(userId, nextPage, false);
    };

    if (!userId) return null;

    return (
        <div className="min-h-screen bg-background pb-8 md:pb-16">
            <TopNavbar userId={userId} />

            <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* LEFT SIDEBAR (Desktop Only) - Filters */}
                <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-6 sticky top-24 h-fit">
                    <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Feeds</h3>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3
                                        ${filter === cat
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                            : 'text-gray-500 hover:bg-gray-50'}
                                    `}
                                >
                                    {cat === 'All' && <Filter size={18} />}
                                    {cat === 'Discussion' && <TrendingUp size={18} />}
                                    {cat === 'Confession' && <span className="text-lg">🐯</span>}
                                    {cat === 'Help' && <Info size={18} />}
                                    {cat === 'Poll' && <BarChart2 size={18} />}
                                    {cat === 'Rant' && <span className="text-lg">😤</span>}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT - Feed */}
                <div className="md:col-span-6 lg:col-span-7">

                    {/* Search & Filters */}
                    <div className="mb-8">
                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search posts..."
                                className="w-full bg-surface border-border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                <Info size={18} />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => { setFilter('All'); setSearchTerm(''); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${filter === 'All' && !searchTerm
                                    ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20'
                                    : 'bg-surface text-muted border-border hover:bg-surface-hover hover:text-foreground'
                                    }`}
                            >
                                <TrendingUp size={16} /> All Posts
                            </button>
                            {categories.filter(c => c !== 'All').map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setFilter(cat); setSearchTerm(''); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${filter === cat && !searchTerm
                                        ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20'
                                        : 'bg-surface text-muted border-border hover:bg-surface-hover hover:text-foreground'
                                        }`}
                                >
                                    {cat === 'Poll' ? <BarChart2 size={16} /> :
                                        cat === 'Discussion' ? <TrendingUp size={16} /> :
                                            cat === 'Help' ? <Info size={16} /> :
                                                cat === 'Confession' ? <span className="text-sm">🐯</span> :
                                                    cat === 'Rant' ? <span className="text-sm">😤</span> :
                                                        <Filter size={16} />}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-8">
                        <CreatePost onPostCreated={() => {
                            if (userId) fetchPosts(userId, 1, true);
                        }} userId={userId || ''} />
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-surface rounded-2xl p-6 shadow-sm border border-border animate-pulse">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                    <div className="h-20 bg-gray-200 rounded-xl mb-2"></div>
                                </div>
                            ))
                            }
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    userId={post.user_id}
                                    content={post.content}
                                    type={post.type}
                                    authorAlias={post.author_alias || 'Anonymous'}
                                    createdAt={post.created_at}
                                    tags={post.tags}
                                    imageUrl={post.image_url}
                                    pollOptions={post.pollOptions}
                                    isAdmin={isAdmin}
                                    initialLiked={post.isLiked}
                                    initialLikesCount={post.upvotes || 0}
                                    currentUserId={userId || undefined}
                                />
                            ))}

                            {posts.length === 0 && (
                                <div className="text-center py-20 text-gray-400">
                                    <p>No posts yet. Be the first!</p>
                                </div>
                            )}

                            {/* Load More Button */}
                            {posts.length > 0 && hasMore && (
                                <div className="text-center pt-4 pb-8">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="px-6 py-2 bg-surface border border-border rounded-full text-sm font-bold text-foreground hover:bg-surface-hover transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : 'Load More Posts'}
                                    </button>
                                </div>
                            )}

                            {!hasMore && posts.length > 0 && (
                                <div className="text-center py-8 text-xs text-muted uppercase tracking-widest">
                                    You've reached the end
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR (Desktop Only) - Notices */}
                <aside className="hidden md:block md:col-span-3 space-y-6 sticky top-24 h-fit">
                    <NoticeBoard />
                    <KarmaLeaderboard />

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                        <h3 className="font-bold text-lg mb-2">Anonymous Confessions 🐯</h3>
                        <p className="text-white/80 text-xs mb-4">Share your secrets safely. Your identity is hidden forever.</p>
                        <button
                            onClick={() => setFilter('Confession')}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold w-full hover:bg-primary-hover transition-colors"
                        >
                            Read Confessions
                        </button>
                    </div>
                </aside>

            </main >
        </div >
    );
}
