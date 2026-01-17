'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Bell, X, ShieldCheck } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface TopNavbarProps {
    userId?: string | null;
}

export function TopNavbar({ userId }: TopNavbarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 0. Check Admin Role
        async function checkAdmin() {
            if (!userId) return;

            // Priority Check: Master Email (Bypasses DB delays)
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email === 'mayankbohara0@gmail.com') {
                console.log("Master Admin Detected: Access Granted");
                setIsAdmin(true);
                return;
            }

            // Standard Check: DB Role
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
            if (profile?.role === 'admin') {
                setIsAdmin(true);
            }
        }
        checkAdmin();

        // 1. Initial Fetch
        async function fetchNotices() {
            const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(5);
            if (data) {
                setNotifications(data);
                const lastRead = localStorage.getItem('lastReadNotice');
                if (data.length > 0) {
                    const latest = new Date(data[0].created_at).getTime();
                    if (!lastRead || latest > parseInt(lastRead)) {
                        setHasUnread(true);
                    }
                }
            }
        }
        fetchNotices();

        // 2. Realtime Subscription
        const channel = supabase
            .channel('public:notices')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, (payload) => {
                console.log('New Notice!', payload);
                const newNotice = payload.new as any;

                // Add to list
                setNotifications(prev => [newNotice, ...prev]);
                setHasUnread(true);

                // Show Toast
                showToast(newNotice);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]); // Re-run when userId changes

    // Toast State
    const [toast, setToast] = useState<any>(null);

    const showToast = (notice: any) => {
        setToast(notice);
        // Play sound? (Optional, maybe too intrusive)
        setTimeout(() => setToast(null), 5000); // Hide after 5s
    };

    const handleOpenNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && notifications.length > 0) {
            setHasUnread(false);
            localStorage.setItem('lastReadNotice', new Date().getTime().toString()); // Mark as read now
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 mb-8">
            <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">

                {/* Logo */}
                <Link href="/feed" className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-lg md:text-xl font-bold font-heading text-primary tracking-tight">SNJB Connect</span>
                </Link>

                {/* Nav Links (Visible on Mobile too since only 2 items) */}
                <div className="flex items-center gap-2 md:gap-6 text-sm font-medium">
                    <Link
                        href="/feed"
                        className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full transition-colors ${isActive('/feed')
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-muted hover:text-foreground hover:bg-surface'
                            }`}
                    >
                        <LayoutGrid size={18} />
                        <span className="hidden md:inline">Feed</span>
                    </Link>

                    <Link
                        href="/resources"
                        className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full transition-colors ${isActive('/resources')
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-muted hover:text-foreground hover:bg-surface'
                            }`}
                    >
                        <FileText size={18} />
                        <span className="hidden md:inline">Resources</span>
                        <span className="md:hidden">Res...</span>
                    </Link>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full transition-colors ${isActive('/admin')
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-muted hover:text-foreground hover:bg-surface'
                                }`}
                        >
                            <ShieldCheck size={18} />
                            <span className="hidden md:inline">Dashboard</span>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={handleOpenNotifications}
                            className="p-2 rounded-full hover:bg-surface text-muted hover:text-foreground relative transition-colors"
                        >
                            <Bell size={20} />
                            {hasUnread && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 animate-fade-in-up overflow-hidden">
                                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-sm">NOTICES (Admin)</h3>
                                    <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-foreground"><X size={16} /></button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-muted text-sm">No new notices.</div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div key={n.id} className="p-4 border-b border-border/50 hover:bg-surface-hover transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                                                            ${n.type === 'exam' ? 'bg-red-100 text-red-700' :
                                                            n.type === 'event' ? 'bg-purple-100 text-purple-700' :
                                                                n.type === 'holiday' ? 'bg-green-100 text-green-700' :
                                                                    'bg-blue-100 text-blue-700'}`}>
                                                        {n.type}
                                                    </span>
                                                    <span className="text-[10px] text-muted">{new Date(n.date).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-bold text-sm text-foreground mb-1">{n.title}</h4>
                                                <p className="text-xs text-muted leading-relaxed line-clamp-2">{n.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile (Desktop Only - Mobile can be simplified) */}
                    {userId ? (
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-sm font-medium text-muted">Welcome</div>
                            <Link href="/profile" className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                                <img src={getAvatarUrl(userId)} alt="Profile" className="w-full h-full object-cover" />
                            </Link>
                        </div>
                    ) : (
                        /* Mobile User Profile Icon */
                        <Link href="/profile" className="md:hidden w-8 h-8 rounded-full bg-surface border border-border overflow-hidden">
                            <img src={getAvatarUrl(userId || '')} alt="Profile" className="w-full h-full object-cover" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Real-time Toast Notification */}
            {toast && (
                <div className="fixed top-24 right-4 md:right-8 z-[100] animate-in slide-in-from-right fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-md border-l-4 border-l-primary shadow-2xl rounded-xl p-4 max-w-sm border-t border-r border-b border-gray-100 flex gap-4 items-start cursor-pointer hover:bg-white transition-colors"
                        onClick={() => { setShowNotifications(true); setToast(null); }}
                    >
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <Bell size={20} className="animate-bounce-slow" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-foreground">New Admin Notice</h4>
                            <p className="text-sm font-medium text-primary mt-0.5">{toast.title}</p>
                            <p className="text-xs text-muted mt-1 line-clamp-1">{toast.content}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setToast(null); }} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}
        </nav >
    );
}
